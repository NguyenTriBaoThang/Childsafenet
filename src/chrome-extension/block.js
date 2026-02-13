function q(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name) || "";
}

const url = q("url");
const label = q("label");
const score = q("score");
const risk = q("risk");

document.getElementById("info").innerHTML = `
  URL: <code>${url}</code><br/>
  Label: <b>${label}</b> • Risk: <b>${risk}</b> • Score: <b>${score}</b>
`;

const openAnyway = document.getElementById("openAnyway");
openAnyway.href = url || "about:blank";
openAnyway.target = "_self";