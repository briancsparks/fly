
module.exports.wrapCode = wrapCode;

function wrapCode(codeStr) {

  return `
    (function(d3) {

      ${codeStr}

    )(d3));`;

}

