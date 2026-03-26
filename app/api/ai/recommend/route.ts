import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/db';
import type { Scheme, SchemeRecommendRequest, SchemeRecommendResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: SchemeRecommendRequest = await request.json();
    const { age_group, gender, occupation, social_category, has_disability } = body;

    // Step 1: Rule-based matching (reuses logic from /api/schemes/recommend)
    const { data: schemes, error } = await supabaseAdmin
      .from('schemes')
      .select('*')
      .eq('is_active', true);

    if (error || !schemes) {
      return NextResponse.json({ success: false, message: 'Failed to fetch schemes.' }, { status: 500 });
    }

    const ageMap: Record<string, number> = {
      below_18: 15, '18_25': 22, '26_35': 30, '36_45': 40, '46_59': 52, '60_plus': 65,
    };
    const userAge = age_group ? ageMap[age_group] || null : null;

    const scoredSchemes: { scheme: Scheme; score: number; reasons: string[] }[] = [];

    for (const scheme of schemes as Scheme[]) {
      const reasons: string[] = [];
      let score = 0;

      if (userAge !== null) {
        const minOk = scheme.min_age === null || userAge >= scheme.min_age;
        const maxOk = scheme.max_age === null || userAge <= scheme.max_age;
        if (minOk && maxOk) { score += 2; reasons.push('Age group eligible'); }
        else continue;
      }

      if (gender && scheme.gender) {
        if (scheme.gender === gender) { score += 3; reasons.push(`Specifically for ${gender}`); }
        else continue;
      } else if (scheme.gender === null) { score += 1; }

      if (occupation && scheme.occupation) {
        if (scheme.occupation === occupation || scheme.target_groups.includes(occupation)) {
          score += 3; reasons.push(`Matches occupation: ${occupation}`);
        }
      }

      if (occupation && scheme.target_groups.includes(occupation)) {
        score += 2;
        if (!reasons.some((r) => r.includes('occupation'))) reasons.push(`Target group includes ${occupation}`);
      }

      if (has_disability && scheme.has_disability) { score += 4; reasons.push('Designed for persons with disability'); }
      else if (has_disability && scheme.category === 'disability') { score += 4; reasons.push('Disability-focused scheme'); }

      if (social_category && scheme.social_category === social_category) {
        score += 2; reasons.push(`For ${social_category} category`);
      }

      if (age_group === '60_plus' && scheme.category === 'senior_citizens') {
        score += 3; if (!reasons.some((r) => r.includes('Senior'))) reasons.push('Senior citizen scheme');
      }

      if (age_group && ['below_18', '18_25'].includes(age_group) && scheme.category === 'students') {
        score += 2; if (!reasons.some((r) => r.includes('Student'))) reasons.push('Student scheme');
      }

      if (reasons.length === 0) reasons.push('General eligibility match');
      if (score > 0) scoredSchemes.push({ scheme, score, reasons });
    }

    scoredSchemes.sort((a, b) => b.score - a.score);
    const topSchemes: SchemeRecommendResult[] = scoredSchemes.slice(0, 5)
      .map(({ scheme, reasons }) => ({ scheme, match_reasons: reasons }));

    // Step 2: Generate Claude explanation (optional — skip if no API key)
    let explanation = '';
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey && topSchemes.length > 0) {
      try {
        const anthropic = new Anthropic({ apiKey });
        const schemesSummary = topSchemes.map((r, i) =>
          `${i + 1}. ${r.scheme.title_en} — ${r.match_reasons.join(', ')}`
        ).join('\n');

        const prompt = `A Delhi citizen with the following profile asked for scheme recommendations:
- Age group: ${age_group || 'not specified'}
- Gender: ${gender || 'not specified'}
- Occupation: ${occupation || 'not specified'}
- Social category: ${social_category || 'not specified'}
- Disability: ${has_disability ? 'yes' : 'no'}

Here are the matching government schemes:
${schemesSummary}

Write a brief, friendly explanation (under 100 words) telling them why these schemes were recommended and encouraging them to apply. Do NOT list the schemes again.`;

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 256,
          messages: [{ role: 'user', content: prompt }],
        });

        const block = response.content[0];
        if (block.type === 'text') {
          explanation = block.text;
        }

        // Log
        try {
          await supabaseAdmin.from('ai_logs').insert({
            input: JSON.stringify(body),
            output: explanation,
            model: 'claude-sonnet-4-20250514',
            type: 'recommend',
          });
        } catch {
          // logging failure is non-critical
        }
      } catch (aiErr) {
        console.error('[AI] recommend explanation error:', aiErr);
        explanation = 'Based on your profile, we found some government schemes you may be eligible for. Please review them below.';
      }
    } else {
      explanation = topSchemes.length > 0
        ? 'Based on your profile, we found some government schemes you may be eligible for.'
        : 'We couldn\'t find specific schemes matching your profile. Try adjusting your details or visit the Delhi government portal.';
    }

    return NextResponse.json({
      success: true,
      recommendations: topSchemes,
      explanation,
      total_matched: scoredSchemes.length,
    });
  } catch (err) {
    console.error('[API] ai recommend error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
