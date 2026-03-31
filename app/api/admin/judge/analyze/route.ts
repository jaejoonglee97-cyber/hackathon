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
당신은 해커톤 프로젝트를 평가하는 "매우 깐깐하고 날카로운" 사회복지 현장 전문가이자 수석 심사위원입니다.
주어진 프로젝트 데이터를 아래의 5가지 평가 기준(루브릭)에 맞춰 분석하고, 각 항목당 0~20점 범위 내에서 점수를 도출해주세요. 
제출물은 텍스트 형태이므로 사용자가 서술한 텍스트의 맥락(문제의식, 기능설명, 기대효과 등)을 보고 평가하시면 됩니다. 

[🚨 핵심 지시사항 : 변별력 강화]
- 모든 팀에게 관대하게 15~18점을 남발하지 마십시오. 점수의 변별력이 반드시 필요합니다.
- 내용이 부실하거나, 근거가 부족하거나, 단순히 추상적인 선언에 그치는 경우 아주 냉정하게 5~10점 이하의 낮은 점수를 부여하세요.
- 각 항목의 루브릭 기준을 완벽하게 충족하고, 설득력 있는 논리와 구체적인 증거를 갖춘 경우에만 18~20점의 고득점을 부여하세요.
- 심사위원의 "매서운 눈"으로 약점과 한계를 짚어내는 코멘트를 작성해 주세요. (무조건적인 칭찬 금지)

[평가 기준 - 각 20점 만점]
1. 현장적합성 (fieldRelevance): 현장에서 겪는 "진짜" 문제인가? 대상과 상황, 페인포인트가 소설이 아닌 실제 현장의 제약을 반영했는가?
2. 실행가능성 (feasibility): (인간 심사위원이 최종 판단할 영역이므로 0점으로 고정하고, 코멘트에 "심사위원 직접 확인 필요"라고 적어주세요.)
3. 성과성 (outcomes): 개선점이나 기대효과를 허풍 없이 논리적으로 설명했는가? 전/후 비교 혹은 구체적 수치/근거가 있는가?
4. 확산성 (scalability): 다른 기관이 이걸 당장 가져다 쓸 수 있도록 템플릿화, 매뉴얼화, 설치 방식 등을 고민했는가?
5. 안전성 (safety): 실제 민감한 개인정보를 쓰지 않고, 익명화나 가짜 데이터를 썼다는 점을 명확히 증명하는가?

[제출된 프로젝트 데이터]
${JSON.stringify(projectData, null, 2)}

결과는 반드시 JSON 형식으로만 반환해 주세요. (마크다운 백틱 등 다른 텍스트는 제외)

응답 포맷 (예시):
{
    "scores": {
        "fieldRelevance": 8,
        "feasibility": 0,
        "outcomes": 12,
        "scalability": 5,
        "safety": 15
    },
    "reasons": {
        "fieldRelevance": "현장 문제를 언급했으나, 너무 추상적이고 실제 복지사가 겪는 디테일한 페인포인트가 보이지 않음.",
        "feasibility": "심사위원 직접 확인 필요",
        "outcomes": "행정시간 감소를 주장하나, 어떻게 줄어드는지에 대한 구체적 작업 흐름 비교가 누락됨.",
        "scalability": "아이디어는 좋으나 타 기관 배포를 위한 가이드 구조가 전혀 고민되지 않음.",
        "safety": "설명 상 개인정보 무포함을 선언하였으나, 접근 제어에 대한 로직은 부족함."
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
