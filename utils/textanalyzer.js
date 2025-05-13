const flesch = require('flesch-kincaid');
const readabilityScores = require('readability-scores');

// extract txt from html
function getMainText(html) {
  let content = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  content = content.replace(/<[^>]+>/g, ' ');
  content = content.replace(/\s+/g, ' ').trim();

  return content;
}

// check reading lvl
function checkReadingLevel(text) {
  try {
    const fleschScore = flesch.rate(text);
    const otherScores = readabilityScores(text);

    return {
      easyToReadScore: fleschScore,
      gradeLevel: otherScores.fleschKincaidGradeLevel,
      automatedIndex: otherScores.automatedReadabilityIndex
    };
  } catch (err) {
    console.error('Error checking reading level:', err);
    return {
      error: 'Could not check reading level',
      easyToReadScore: null,
      gradeLevel: null,
      automatedIndex: null
    };
  }
}

// find common words
function checkTopWords(text, keyword) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordCnt = words.length;

  if (wordCnt === 0) {
    return {
      totalWords: 0,
      keywordPercent: 0,
      topWords: []
    };
  }

  const freq = {};
  words.forEach(word => {
    if (word.length <= 2) return;
    freq[word] = (freq[word] || 0) + 1;
  });

  const topWords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({
      word,
      count,
      percent: (count / wordCnt * 100).toFixed(2) + '%'
    }));

  let keywordPct = 0;
  if (keyword) {
    const keywordRegex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
    const keywordMatches = text.toLowerCase().match(keywordRegex) || [];
    keywordPct = keywordMatches.length / wordCnt * 100;
  }

  return {
    totalWords: wordCnt,
    keywordPercent: keyword ? keywordPct : null,
    topWords
  };
}

module.exports = {
  getMainText,
  checkReadingLevel,
  checkTopWords
};
