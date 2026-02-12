
export default function PrivacyPage() {
    return (
        <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 800 }}>개인정보 처리방침</h1>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 700 }}>1. 개인정보의 처리 목적</h2>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    &apos;열매똑똑 해커톤&apos;은(는) 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                </p>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem', color: '#4b5563', lineHeight: 1.6 }}>
                    <li>회원 가입 및 관리</li>
                    <li>해커톤 참여 신청 및 팀 구성</li>
                    <li>대회 심사 및 운영 안내</li>
                    <li>문의 사항 처리 및 결과 회신</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 700 }}>2. 수집하는 개인정보 항목</h2>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>회사는 서비스 제공을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem', color: '#4b5563', lineHeight: 1.6 }}>
                    <li><strong>필수항목:</strong> 성명, 연락처, 소속기관, 생년월일, 이메일 주소</li>
                    <li><strong>선택항목:</strong> 직무 관련 경력 사항 등</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 700 }}>3. 개인정보의 보유 및 이용 기간</h2>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
                    <br />
                    - 보유 기간: 사업 종료 시까지 (별도 법령에 따름)
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 700 }}>4. 개인정보의 제3자 제공</h2>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
                </p>
            </section>

            <section style={{ marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 700 }}>5. 개인정보 보호책임자</h2>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만 처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                </p>
                <div style={{ background: '#f3f4f6', padding: '1rem', marginTop: '1rem', borderRadius: '0.5rem' }}>
                    <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>담당자: 운영사무국</p>
                    <p style={{ margin: '0.2rem 0' }}>연락처: 02-786-2962</p>
                    <p style={{ margin: '0.2rem 0' }}>이메일: sasw@sasw.or.kr</p>
                </div>
            </section>
        </div>
    );
}
