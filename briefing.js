const sources = [
  {name: 'MSD Manual · 신생아 호흡곤란증후군', url: 'https://www.msdmanuals.com/professional/pediatrics/respiratory-problems-in-neonates/respiratory-distress-syndrome-in-neonates'},
  {name: 'MSD Manual · 신생아 일과성 빈호흡', url: 'https://www.msdmanuals.com/professional/pediatrics/respiratory-problems-in-neonates/transient-tachypnea-of-the-newborn'},
  {name: 'Gordon · 깊은 늑횡격막각 징후', url: 'https://pubmed.ncbi.nlm.nih.gov/7384513/'},
  {name: 'WHO · 미숙아 및 저체중 출생아 돌봄 권고', url: 'https://www.ncbi.nlm.nih.gov/books/NBK586699/'},
];
const cases = [
  {
    id: 'preterm', title: '미숙아의 초기 호흡곤란', age: '29주 2일',
    course: '출생 20분 후부터 빈호흡, 함몰, 호기 시 신음',
    film: '저팽창, 양측 미세 과립상 음영, 공기기관지조영',
    inference: '재태연령, 이른 발현, 저팽창을 함께 보면 신생아 호흡곤란증후군(RDS)이 가장 잘 맞습니다.',
    alternatives: '폐렴도 비슷한 미만성 음영을 보일 수 있습니다. 산모의 감염 위험인자와 환아 상태를 함께 봅니다.',
    missing: '산모 발열·양막파수 여부, 산소화 추이, 혈액가스',
    references: [0,3]
  },
  {
    id: 'term', title: '제왕절개 후 만삭아의 빈호흡', age: '39주',
    course: '진통 없는 제왕절개 후 1시간 이내 빈호흡. 경과 중 호전',
    film: '폐 과팽창, 엽간열 액체 음영',
    inference: '폐액 흡수 지연에 따른 신생아 일과성 빈호흡(TTN)이 잘 맞습니다.',
    alternatives: '호전되지 않거나 전신 상태가 나빠지면 감염 등 다른 원인을 다시 고려합니다.',
    missing: '산소 요구량의 시간별 변화, 감염 위험인자',
    references: [1]
  },
  {
    id: 'sudden', title: '양압환기 중 갑작스러운 악화', age: '28주',
    course: '갑작스러운 산소포화도 하락과 좌측 호흡음 감소',
    film: '좌측 늑횡격막각의 깊이와 투과성 증가',
    urgent: true,
    inference: '좌측 흉막강에 공기가 찬 기흉을 의심합니다. 깊은 늑횡격막각은 앙와위 영상에서 기흉의 단서가 될 수 있습니다.',
    alternatives: '기도관 위치 이상이나 폐쇄도 급격한 악화를 일으킬 수 있습니다.',
    missing: '혈압 등 혈역학 상태와 기도관 위치. 사진 한 장으로 긴장성 여부는 확정할 수 없습니다.',
    references: [2]
  },
  {
    id: 'missing', title: '영상이 없는 빈호흡', age: '미기록',
    course: '빈호흡이 기록됨. 발현 시점과 경과 미기록',
    film: '미제공',
    incomplete: true,
    inference: '현재 입력만으로 RDS, TTN, 감염, 기흉의 우선순위를 정하기 어렵습니다.',
    alternatives: '폐 용적과 엽간열 액체 여부, 일측 호흡음 변화 등 실제 관찰값으로 감별을 좁힐 수 있습니다.',
    missing: '재태연령, 발현 시점, 분만 방식, 산소화 경과, 흉부 영상',
    references: [0,1,2]
  }
];

const geminiPreviews = {
  preterm: '조산아에서 출생 직후 호흡곤란과 저팽창·미세 과립상 음영이 함께 나타나므로 RDS에 가장 부합합니다. 선천성 폐렴 등 감염성 원인은 이 정보만으로 배제할 수 없습니다.',
  term: '진통 없는 제왕절개 후 초기 빈호흡, 호전하는 경과, 폐액 저류 소견은 TTN을 시사합니다. 산소 요구량 추이와 진찰 소견을 더 확인합니다.',
  sudden: '양압환기 중 급격한 산소화 악화와 좌측 호흡음 감소는 응급 평가가 우선입니다. 좌측 깊은 늑횡격막각은 기흉의 단서이며, 긴장성 여부는 주어진 영상으로 단정할 수 없습니다.',
  missing: '빈호흡만 기록되어 재태연령, 발현 시점, 경과, 흉부 영상이 빠져 있습니다. 단일 진단을 특정하지 않고 위 항목의 확인을 우선합니다.'
};

const $ = id => document.getElementById(id);
const el = (tag, value) => {
  const node = document.createElement(tag);
  node.textContent = value;
  return node;
};
const initialId = new URL(location.href).searchParams.get('case');
let current = cases.find(item => item.id === initialId) ?? cases[0];

function renderCase(next) {
  current = next;
  $('case-title').textContent = next.title;
  $('insufficient').hidden = !next.incomplete;
  $('urgency').hidden = !next.urgent;
  $('urgency').textContent = next.urgent ? '급격한 악화가 있는 가상 증례 · 응급 평가가 우선입니다.' : '';
  $('observations').replaceChildren(
    el('dt','재태연령'), el('dd',next.age),
    el('dt','임상 경과'), el('dd',next.course),
    el('dt','흉부 영상'), el('dd',next.film)
  );
  for (const button of $('case-list').children) {
    button.setAttribute('aria-pressed',String(button.dataset.case === next.id));
  }
  $('summary').hidden = true;
  $('summary').replaceChildren();
  $('sources').replaceChildren(...next.references.map(index => {
    const source = sources[index];
    const line = el('li','');
    const link = el('a',source.name);
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    line.append(link);
    return line;
  }));
}

for (const item of cases) {
  const button = el('button',item.title);
  button.dataset.case = item.id;
  button.addEventListener('click',()=>{
    const url = new URL(location.href);
    url.searchParams.set('case',item.id);
    history.replaceState(null,'',url);
    renderCase(item);
  });
  $('case-list').append(button);
}

function block(title, value) {
  const section = el('section','');
  section.append(el('h3',title),el('p',value));
  return section;
}

$('summarize').addEventListener('click',()=>{
  $('summary').replaceChildren(
    el('h2','교육용 브리핑'),
    block(current.incomplete ? '판단을 보류하는 이유' : '가장 잘 맞는 설명', current.inference),
    block('함께 고려할 원인', current.alternatives),
    block('추가로 필요한 정보', current.missing)
  );
  const preview = el('details','');
  preview.append(el('summary','Gemini 사전 실행 결과'),el('p',geminiPreviews[current.id]));
  $('summary').append(preview);
  $('summary').hidden=false;
});
renderCase(current);
