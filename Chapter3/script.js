/**
 * 2차 함수(이차방정식) 계산기
 * ax^2 + bx + c = 0 의 근, 꼭짓점, 판별식 계산 + 그래프(Canvas)
 */
(function () {
  var form = document.getElementById("quadraticForm");
  var resultEl = document.getElementById("result");
  var equationText = document.getElementById("equationText");
  var rootsEl = document.getElementById("roots");
  var vertexEl = document.getElementById("vertex");
  var discriminantEl = document.getElementById("discriminant");
  var canvas = document.getElementById("graphCanvas");

  if (!form || !resultEl) return;

  function formatNumber(num) {
    if (!isFinite(num)) return String(num);
    if (Math.abs(num) < 0.0001 && num !== 0) return num.toExponential(3);
    return String(parseFloat(num.toFixed(6)));
  }

  function formatEquation(a, b, c) {
    var parts = [];

    if (a !== 0) {
      if (a === 1) parts.push("x²");
      else if (a === -1) parts.push("-x²");
      else parts.push(formatNumber(a) + "x²");
    }

    if (b !== 0) {
      var bAbs = Math.abs(b);
      var bTerm = (bAbs === 1 ? "x" : formatNumber(bAbs) + "x");
      parts.push((b > 0 && parts.length ? "+ " : b < 0 ? "- " : "") + bTerm);
    }

    if (c !== 0) {
      var cAbs = Math.abs(c);
      parts.push((c > 0 && parts.length ? "+ " : c < 0 ? "- " : "") + formatNumber(cAbs));
    }

    if (parts.length === 0) return "0 = 0";
    return parts.join(" ") + " = 0";
  }

  function calculateRoots(a, b, c) {
    if (a === 0) {
      if (b === 0) {
        return {
          discriminant: null,
          type: c === 0 ? "무수히 많은 해" : "해 없음",
          roots: [],
        };
      }
      return {
        discriminant: null,
        type: "일차방정식 (해 1개)",
        roots: [-c / b],
      };
    }

    var D = b * b - 4 * a * c;
    if (D > 0) {
      var s = Math.sqrt(D);
      return {
        discriminant: D,
        type: "서로 다른 두 실근",
        roots: [(-b + s) / (2 * a), (-b - s) / (2 * a)],
      };
    }
    if (D === 0) {
      return {
        discriminant: D,
        type: "중근 (해 1개)",
        roots: [-b / (2 * a)],
      };
    }

    var real = -b / (2 * a);
    var imag = Math.sqrt(-D) / (2 * a);
    return {
      discriminant: D,
      type: "허근 (실근 없음)",
      roots: [{ real: real, imag: imag }, { real: real, imag: -imag }],
    };
  }

  function calculateVertex(a, b, c) {
    if (a === 0) return null;
    var x = -b / (2 * a);
    var y = a * x * x + b * x + c;
    return { x: x, y: y };
  }

  function displayRoots(rootsResult) {
    if (!rootsEl) return;
    var roots = rootsResult.roots || [];
    var html = '<p class="root-type">' + rootsResult.type + "</p>";

    if (roots.length === 0) {
      html += '<p class="no-roots">표시할 근이 없습니다.</p>';
      rootsEl.innerHTML = html;
      return;
    }

    if (typeof roots[0] === "object" && roots[0] && "imag" in roots[0]) {
      var r1 = roots[0];
      var r2 = roots[1];
      html += '<div class="complex-roots">';
      html +=
        "<p>x₁ = " +
        formatNumber(r1.real) +
        (r1.imag >= 0 ? " + " : " - ") +
        formatNumber(Math.abs(r1.imag)) +
        "i</p>";
      html +=
        "<p>x₂ = " +
        formatNumber(r2.real) +
        (r2.imag >= 0 ? " + " : " - ") +
        formatNumber(Math.abs(r2.imag)) +
        "i</p>";
      html += "</div>";
      rootsEl.innerHTML = html;
      return;
    }

    html += '<div class="real-roots">';
    for (var i = 0; i < roots.length; i++) {
      html += '<p class="root-value">x' + (i + 1) + " = " + formatNumber(roots[i]) + "</p>";
    }
    html += "</div>";
    rootsEl.innerHTML = html;
  }

  function displayVertex(vertex) {
    if (!vertexEl) return;
    if (!vertex) {
      vertexEl.innerHTML = '<p class="no-vertex">꼭짓점이 없습니다(일차/상수식).</p>';
      return;
    }
    vertexEl.innerHTML =
      '<p class="vertex-value">(' + formatNumber(vertex.x) + ", " + formatNumber(vertex.y) + ")</p>";
  }

  function displayDiscriminant(rootsResult, a) {
    if (!discriminantEl) return;
    if (a === 0) {
      discriminantEl.innerHTML = '<p class="no-discriminant">일차방정식은 판별식을 사용하지 않습니다.</p>';
      return;
    }
    var D = rootsResult.discriminant;
    var hint = "";
    if (D > 0) hint = " (서로 다른 두 실근)";
    else if (D === 0) hint = " (중근)";
    else hint = " (허근)";
    discriminantEl.innerHTML = '<p class="discriminant-value">D = ' + formatNumber(D) + hint + "</p>";
  }

  function drawGraph(a, b, c, rootsResult, vertex) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var width = canvas.width;
    var height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f9f9f9";
    ctx.fillRect(0, 0, width, height);

    if (a === 0) {
      ctx.fillStyle = "#666";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText("일차/상수식은 포물선 그래프가 아닙니다.", width / 2, height / 2);
      return;
    }

    var xRange = 10;
    var yRange = 10;
    if (vertex) {
      xRange = Math.max(xRange, Math.abs(vertex.x) * 2, 5);
      yRange = Math.max(yRange, Math.abs(vertex.y) * 2, 5);
    }

    var roots = rootsResult.roots || [];
    if (roots.length && typeof roots[0] !== "object") {
      for (var i = 0; i < roots.length; i++) xRange = Math.max(xRange, Math.abs(roots[i]) * 1.6);
    }

    function toCanvasX(x) {
      return (x / xRange) * (width / 2) + width / 2;
    }
    function toCanvasY(y) {
      return height / 2 - (y / yRange) * (height / 2);
    }
    function fromCanvasX(cx) {
      return ((cx - width / 2) * xRange) / (width / 2);
    }

    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (var gx = -Math.floor(xRange); gx <= Math.floor(xRange); gx++) {
      if (gx === 0) continue;
      var x = toCanvasX(gx);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (var gy = -Math.floor(yRange); gy <= Math.floor(yRange); gy++) {
      if (gy === 0) continue;
      var y = toCanvasY(gy);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    ctx.fillStyle = "#333";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("0", width / 2 + 10, height / 2 - 8);
    ctx.fillText("x", width - 10, height / 2 - 8);
    ctx.textAlign = "right";
    ctx.fillText("y", width / 2 - 8, 16);

    ctx.strokeStyle = "#2196F3";
    ctx.lineWidth = 3;
    ctx.beginPath();
    var first = true;
    for (var cx = 0; cx <= width; cx += 2) {
      var xVal = fromCanvasX(cx);
      var yVal = a * xVal * xVal + b * xVal + c;
      var cy = toCanvasY(yVal);
      if (first) {
        ctx.moveTo(cx, cy);
        first = false;
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();

    if (vertex) {
      var vx = toCanvasX(vertex.x);
      var vy = toCanvasY(vertex.y);
      ctx.fillStyle = "#FF9800";
      ctx.beginPath();
      ctx.arc(vx, vy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#333";
      ctx.font = "11px Arial";
      ctx.textAlign = "left";
      ctx.fillText("꼭짓점", vx + 10, vy - 6);
    }

    if (roots.length && typeof roots[0] !== "object") {
      ctx.fillStyle = "#4CAF50";
      for (var r = 0; r < roots.length; r++) {
        var rx = toCanvasX(roots[r]);
        var ry = toCanvasY(0);
        ctx.beginPath();
        ctx.arc(rx, ry, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var aInput = document.getElementById("a");
    var bInput = document.getElementById("b");
    var cInput = document.getElementById("c");
    if (!aInput || !bInput || !cInput) return;

    var a = parseFloat(aInput.value);
    var b = parseFloat(bInput.value);
    var c = parseFloat(cInput.value);

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      alert("a, b, c 값을 모두 숫자로 입력해주세요.");
      return;
    }

    if (equationText) equationText.textContent = formatEquation(a, b, c);

    var rootsResult = calculateRoots(a, b, c);
    var vertex = calculateVertex(a, b, c);

    displayRoots(rootsResult);
    displayVertex(vertex);
    displayDiscriminant(rootsResult, a);
    drawGraph(a, b, c, rootsResult, vertex);

    resultEl.classList.remove("hidden");
  });
})();
