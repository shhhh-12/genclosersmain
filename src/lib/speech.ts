// "Repeat the line" scoring, shared by the browser (live highlight) and the server (the real score).

export function words(s: string) {
  return s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Which target words were said, in order (longest common subsequence), so skipping or
 * swapping words costs points but small extra words don't.
 */
export function matchWords(target: string, said: string) {
  const t = words(target);
  const s = words(said);
  const dp = Array.from({ length: t.length + 1 }, () => new Array<number>(s.length + 1).fill(0));
  for (let i = t.length - 1; i >= 0; i--)
    for (let j = s.length - 1; j >= 0; j--) dp[i][j] = t[i] === s[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const hit = new Array<boolean>(t.length).fill(false);
  let i = 0;
  let j = 0;
  while (i < t.length && j < s.length) {
    if (t[i] === s[j]) {
      hit[i] = true;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  const ratio = t.length ? hit.filter(Boolean).length / t.length : 0;
  return { targetWords: t, hit, ratio };
}
