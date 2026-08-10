(function(){
  const progressEl = document.getElementById('quizProgress');
  const qBody = document.getElementById('quizQuestions');
  const resultBody = document.getElementById('quizResult');
  if(!progressEl || !qBody || !resultBody) return;

  const QUESTIONS = [
    {
      key: 'female',
      text: 'How do you identify?',
      options: [
        { label: 'Woman', value: 1 },
        { label: 'Man', value: 0 },
        { label: 'Prefer not to say', value: 0.5 }
      ]
    },
    {
      key: 'rural',
      text: 'Where do you live?',
      options: [
        { label: 'Rural area', value: 1 },
        { label: 'Urban area', value: 0 }
      ]
    },
    {
      key: 'mobile',
      text: 'Do you own a mobile phone?',
      options: [
        { label: 'Yes', value: 1 },
        { label: 'No', value: 0 }
      ]
    },
    {
      key: 'internet',
      text: 'Do you use the internet regularly?',
      options: [
        { label: 'Yes, regularly', value: 1 },
        { label: 'Rarely or never', value: 0 }
      ]
    },
    {
      key: 'save',
      text: 'Do you save money regularly - formally, through mobile money, or informally?',
      options: [
        { label: 'Yes, regularly', value: 1 },
        { label: 'Not really', value: 0 }
      ]
    }
  ];

  const SEGMENTS = [
    {
      name: 'Digitally Excluded',
      centroid: { female: 0.963, rural: 0.51, mobile: 0.283, internet: 0.097, save: 0.046 },
      share: '43.1%', pctFemale: '96.3%', pctExcluded: '89.3%',
      desc: 'Low phone and internet access, and the group most likely to be entirely outside the formal financial system - 96% of this segment are women.'
    },
    {
      name: 'Connected but Unengaged',
      centroid: { female: 0.163, rural: 0.46, mobile: 0.980, internet: 0.623, save: 0.101 },
      share: '44.3%', pctFemale: '16.3%', pctExcluded: '66.8%',
      desc: 'Near-universal phone and internet access - but two-thirds are still formally excluded from finance. Access clearly is not the barrier here.'
    },
    {
      name: 'Advanced Adopters',
      centroid: { female: 0.103, rural: 0.286, mobile: 0.984, internet: 0.937, save: 0.706 },
      share: '12.6%', pctFemale: '10.3%', pctExcluded: '0.8%',
      desc: 'Full access and full engagement - digital payments, saving, and credit all in regular use. Only 1 in 8 people in the data reach this point.'
    }
  ];

  let current = 0;
  const answers = {};

  function renderProgress(){
    progressEl.innerHTML = QUESTIONS.map((_, i) =>
      '<div class="quiz-dot ' + (i < current ? 'done' : '') + '"></div>'
    ).join('');
  }

  function renderQuestion(){
    renderProgress();
    const q = QUESTIONS[current];
    qBody.innerHTML =
      '<div class="quiz-question">' + q.text + '</div>' +
      '<div class="quiz-options">' +
      q.options.map((opt) => '<button class="quiz-opt" data-value="' + opt.value + '">' + opt.label + '</button>').join('') +
      '</div>' +
      '<button class="quiz-back" id="quizBackBtn" ' + (current === 0 ? 'disabled' : '') + '>Back</button>';

    qBody.querySelectorAll('.quiz-opt').forEach((btn) => {
      btn.addEventListener('click', () => {
        answers[q.key] = parseFloat(btn.getAttribute('data-value'));
        current++;
        if(current < QUESTIONS.length) renderQuestion();
        else showResult();
      });
    });

    document.getElementById('quizBackBtn').addEventListener('click', () => {
      if(current > 0){
        current--;
        renderQuestion();
      }
    });
  }

  function showResult(){
    let best = null;
    let bestDist = Infinity;

    SEGMENTS.forEach((seg) => {
      let dist = 0;
      Object.keys(seg.centroid).forEach((k) => {
        const d = (answers[k] ?? 0.5) - seg.centroid[k];
        dist += d * d;
      });
      dist = Math.sqrt(dist);
      if(dist < bestDist){
        bestDist = dist;
        best = seg;
      }
    });

    qBody.style.display = 'none';
    resultBody.classList.add('active');
    document.getElementById('qrTitle').textContent = best.name;
    document.getElementById('qrDesc').textContent = best.desc;
    document.getElementById('qrStats').innerHTML =
      '<div class="quiz-stat"><span class="n">' + best.share + '</span><span class="l">of the sample is in this group</span></div>' +
      '<div class="quiz-stat"><span class="n">' + best.pctFemale + '</span><span class="l">of this group are women</span></div>' +
      '<div class="quiz-stat"><span class="n">' + best.pctExcluded + '</span><span class="l">of this group are formally excluded</span></div>';

    document.getElementById('quizShare').onclick = () => {
      const text = 'I took the "Which segment are you in?" quiz on The Gap - a data story about digital finance in Pakistan. My closest match: ' + best.name + ' (' + best.share + ' of the sample). See the research: [link]';
      if(navigator.clipboard){
        navigator.clipboard.writeText(text).then(() => {
          const btn = document.getElementById('quizShare');
          const original = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = original; }, 1800);
        });
      }
    };
  }

  document.getElementById('quizRestart').addEventListener('click', () => {
    current = 0;
    Object.keys(answers).forEach((k) => delete answers[k]);
    resultBody.classList.remove('active');
    qBody.style.display = 'flex';
    renderQuestion();
  });

  renderQuestion();
})();
