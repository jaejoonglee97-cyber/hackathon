import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user || !['admin', 'judge'].includes(user.role)) {
            return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        const body = await req.json();
        const { teamId, projectData } = body;

        if (!projectData) {
            return NextResponse.json({ error: '프로젝트 데이터가 없습니다.' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: '서버에 GEMINI_API_KEY 가 설정되지 않았습니다.' }, { status: 500 });
        }
        const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

        const prompt = `
당신은 해커톤 프로젝트를 평가하는 사회복지 현장 전문가이자 심사위원입니다.
주어진 프로젝트 데이터를 아래의 5가지 평가 기준(루브릭)에 맞춰 분석하고, 각 항목당 0~20점 범위 내에서 점수를 도출해주세요. 
제출물은 텍스트 형태이므로 사용자가 서술한 텍스트의 맥락(문제의식, 기능설명, 기대효과 등) 및 프로토타입 링크가 있는지 여부만을 보고 평가하시면 됩니다. 외부 링크의 실제 구동 여부는 인간 심사위원이 최종 확인합니다.

[평가 기준 - 각 20점 만점]
1. 현장적합성 (fieldRelevance): 현장에서 반복되는 문제인가? 구체적인 상황과 대상을 명시했는가?
2. 실행가능성 (feasibility): 솔루션이 실제로 동작할 법한 구체성을 지니는가? (프로토타입 링크가 있으면 가점 부여)
3. 성과성 (outcomes): 개선점 혹은 기대효과를 논리적이고 구체적으로 설명하는가?
4. 확산성 (scalability): 다른 기관에서도 쉽게 따라할 수 있도록 확산 계획(재사용성, 공유 가이드)이 있는가?
5. 안전성 (safety): 개인정보 유출을 방지하기 위해 실명이 아닌 가상데이터나 익명화를 고려했는가? (데이터 상의 안전성 표기 체크)

[제출된 프로젝트 데이터]
${JSON.stringify(projectData, null, 2)}

결과는 반드시 JSON 형식으로만 반환해 주세요. (마크다운 백틱 등 다른 텍스트는 제외)

응답 포맷 (예시):
{
    "scores": {
        "fieldRelevance": 18,
        "feasibility": 15,
        "outcomes": 17,
        "scalability": 14,
        "safety": 19
    },
    "reasons": {
        "fieldRelevance": "현장 문제를 구체적으로 서술함.",
        "feasibility": "프로토타입 링크가 제공되어 있음.",
        "outcomes": "행정시간 감소 등 명확한 효과를 서술함.",
        "scalability": "전략은 있으나 템플릿 제공이 구체적이지 않음.",
        "safety": "안전성 체크리스트에서 개인정보 무포함을 선언함."
    }
}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // JSON 추출
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI가 유효한 JSON을 반환하지 않았습니다.');
        }
        
        const parsed = JSON.parse(jsonMatch[0]);

        return NextResponse.json({ success: true, analysis: parsed });
    } catch (error: any) {
        console.error('AI Analyze Error:', error);
        return NextResponse.json(
            { error: error?.message || 'AI 분석 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
