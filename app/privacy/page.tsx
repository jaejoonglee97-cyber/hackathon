
export default function PrivacyPage() {
    const sectionStyle = { marginBottom: '2rem' } as const;
    const headingStyle = { fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 700 } as const;
    const textStyle = { lineHeight: 1.8, color: '#4b5563' } as const;
    const listStyle = { listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem', color: '#4b5563', lineHeight: 1.8 } as const;
    const subListStyle = { ...listStyle, listStyle: 'circle' as const, marginTop: '0.25rem' };

    return (
        <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800 }}>개인정보 처리방침</h1>
            <p style={{ ...textStyle, marginBottom: '0.5rem' }}>
                <strong>(열매똑똑 해커톤)</strong>
            </p>
            <p style={{ ...textStyle, marginBottom: '2rem' }}>
                시행일자: 2026. 3. 7.
            </p>
            <p style={{ ...textStyle, marginBottom: '2.5rem' }}>
                &apos;열매똑똑 해커톤&apos;(이하 &quot;해커톤&quot;)은 「개인정보 보호법」에 따라 개인정보 처리방침을 수립·공개합니다.
            </p>

            {/* 1. 처리 목적 */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>1. 개인정보의 처리 목적</h2>
                <p style={textStyle}>
                    해커톤은 다음 목적을 위해 개인정보를 처리하며, 아래 목적 외 용도로는 이용하지 않습니다. 목적이 변경되는 경우 「개인정보 보호법」 제18조에 따라 필요한 조치를 이행합니다.
                </p>
                <ul style={listStyle}>
                    <li>해커톤 참여 신청 접수 및 참가자 식별·연락</li>
                    <li>팀 구성 및 운영(제출물 접수/관리, 일정 안내)</li>
                    <li>심사 진행 및 결과 안내</li>
                    <li>문의사항 처리 및 결과 회신</li>
                    <li>부정 이용 방지 및 분쟁 대응을 위한 기록 보존</li>
                </ul>
                <p style={{ ...textStyle, marginTop: '1rem', padding: '0.75rem 1rem', background: '#fef3c7', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                    ※ 해커톤은 복지 이용자(클라이언트) 개인정보 제출을 요구하지 않습니다. 참가자는 제출물에 이용자 실명/연락처/주민등록번호 등 개인정보가 포함되지 않도록 주의해 주세요(불가피할 경우 비식별 처리 권장).
                </p>
            </section>

            {/* 2. 수집 항목 및 수집 방법 */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>2. 수집하는 개인정보 항목 및 수집 방법</h2>
                <ul style={listStyle}>
                    <li><strong>수집 방법:</strong> 해커톤 신청 사이트(온라인 신청 폼)</li>
                    <li><strong>필수항목:</strong> 성명, 연락처(휴대전화), 소속기관, 이메일 주소</li>
                    <li>
                        <strong>자동 생성·수집 가능 항목(서비스 이용 과정):</strong> 접속 로그, 접속 IP 등(보안 및 서비스 안정 운영 목적)
                    </li>
                </ul>
            </section>

            {/* 3. 처리 및 보유 기간 */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>3. 개인정보의 처리 및 보유 기간</h2>
                <p style={textStyle}>
                    해커톤은 법령에 따른 보유기간 또는 정보주체로부터 동의받은 기간 내에서 개인정보를 처리·보유합니다.
                </p>
                <ul style={listStyle}>
                    <li>
                        <strong>참가 신청 정보</strong>(이름/연락처/소속/이메일 등): 해커톤 종료 후 <strong>3개월</strong> 보관 후 파기(문의·분쟁 대응)
                    </li>
                    <li>
                        <strong>심사/운영 기록</strong>(제출물/심사결과 등): 해커톤 종료 후 <strong>1년</strong> 보관 후 파기(이의제기 대응, 성과관리)
                    </li>
                    <li>
                        <strong>(해당 시) 수상자 관련 정산 자료:</strong> 관계 법령 및 내부 정산 기준에 따라 보관 후 파기(기관 내부 기준에 따라 기간 확정)
                    </li>
                </ul>
            </section>

            {/* 4. 제3자 제공 */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>4. 개인정보의 제3자 제공</h2>
                <p style={textStyle}>
                    해커톤은 원칙적으로 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 다만, 정보주체의 동의를 받거나 법령에 근거가 있는 경우에 한하여 제공할 수 있습니다.
                </p>
            </section>

            {/* 5. 처리 위탁 */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>5. 개인정보 처리 위탁</h2>
                <p style={textStyle}>
                    현재 해커톤은 개인정보 처리업무를 위탁하지 않습니다.
                </p>
                <p style={textStyle}>
                    향후 위탁이 발생하는 경우, 위탁업무 내용과 수탁자를 본 처리방침을 통해 공개하겠습니다.
                </p>
            </section>

            {/* 6. 정보주체의 권리 */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>6. 정보주체의 권리 및 행사 방법</h2>
                <p style={textStyle}>
                    정보주체는 해커톤에 대해 언제든지 다음 권리를 행사할 수 있습니다.
                </p>
                <ul style={listStyle}>
                    <li>개인정보 열람 요구</li>
                    <li>개인정보 정정·삭제 요구</li>
                    <li>개인정보 처리정지 요구 및 동의 철회</li>
                </ul>
                <p style={{ ...textStyle, marginTop: '0.5rem' }}>
                    <strong>행사 방법:</strong> 아래 10번의 연락처(전화/이메일)로 요청하시면, 확인 절차 후 관련 법령에 따라 조치합니다.
                </p>
            </section>

            {/* 7. 파기 절차 및 방법 */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>7. 개인정보의 파기 절차 및 방법</h2>
                <p style={textStyle}>
                    해커톤은 개인정보 보유기간 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 파기합니다.
                </p>
                <ul style={listStyle}>
                    <li><strong>파기 절차:</strong> 파기 대상 선정 → 내부 확인 → 파기</li>
                    <li><strong>파기 방법:</strong> 전자파일은 복구 불가능한 방식으로 삭제, 출력물은 분쇄 또는 소각</li>
                </ul>
            </section>

            {/* 8. 안전성 확보조치 */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>8. 개인정보의 안전성 확보조치</h2>
                <p style={textStyle}>
                    해커톤은 개인정보가 분실·도난·유출·변조·훼손되지 않도록 내부 관리 및 접근통제 등 안전성 확보에 필요한 조치를 시행합니다.
                </p>
            </section>

            {/* 9. 쿠키 */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>9. 쿠키(cookie)의 설치·운영 및 거부</h2>
                <p style={textStyle}>
                    해커톤 신청 사이트는 서비스 제공 과정에서 쿠키를 사용할 수 있습니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으며, 거부 시 일부 기능이 제한될 수 있습니다.
                </p>
            </section>

            {/* 10. 보호책임자 및 문의처 */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>10. 개인정보 보호책임자 및 문의처</h2>
                <div style={{ background: '#f3f4f6', padding: '1rem 1.25rem', marginTop: '0.5rem', borderRadius: '0.5rem' }}>
                    <p style={{ margin: '0.3rem 0', fontWeight: 600 }}>담당자: 서울시사회복지사협회 이재중 사회복지사</p>
                    <p style={{ margin: '0.3rem 0' }}>연락처: 070-5155-2113</p>
                    <p style={{ margin: '0.3rem 0' }}>이메일: client_first@sasw.or.kr</p>
                </div>
                <p style={{ ...textStyle, marginTop: '0.75rem' }}>
                    개인정보 보호 관련 문의, 불만처리, 피해구제 요청은 위 연락처로 접수하실 수 있습니다.
                </p>
            </section>

            {/* 11. 처리방침 변경 */}
            <section style={{ marginBottom: '4rem' }}>
                <h2 style={headingStyle}>11. 개인정보 처리방침의 변경</h2>
                <p style={textStyle}>
                    본 처리방침의 내용이 추가·삭제·수정되는 경우, 해커톤 신청 사이트 등을 통해 변경 사항을 안내하겠습니다.
                </p>
            </section>
        </div>
    );
}
