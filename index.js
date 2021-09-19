function skipSpace(string) {
    // позиция первого символа в строке, не являющегося пробелом
    let first = string.search(/\S/);

    // если таковых символов нет - возвращается пустая строка
    if (first == -1) return "";

    // возвращается строка, с удаленными пробелами в начале
    return string.slice(first);
}


function parseExpression(program) {
    program = skipSpace(program);

    let match, expr;

    // match[0] - сопоставленный текст, match[1] - первые круглые скобки regexp
    // строка
    if (match = /^"([^"]*)"/.exec(program)) {
        expr = {type: "value", value: match[1]};
    // число
    } else if (match = /^\d+\b/.exec(program)) {
        expr = {type: "value", value: Number(match[0])};
    // название переменной или оператор
    } else if (match = /^[^\s(),#"]+/.exec(program)) {
        expr = {type: "word", name: match[0]};
    } else {
        throw new SyntaxError("Unexpected syntax: " + program);
    }

    // передаются объект выражения и оставшийся код программы без этого выражения
    return parseApply(expr, program.slice(match[0].length));
}

function parseApply(expr, program) {
    // удаляем пробел
    program = skipSpace(program);

    // если далее не следуюет скобка, то это не конструкция и парсить больше нечего
    // возвращается объект выражения и оставшийся текст, чем бы он ни был
    if (program[0] != "(") {
        return {expr: expr, rest: program};
    }

    program = skipSpace(program.slice(1));

    expr = {type: "apply", operator: expr, args: []};

    while (program[0] != ")") {
        let arg = parseExpression(program);

        expr.args.push(arg.expr);

        program = skipSpace(arg.rest);

        if (program[0] == ",") {
            program = skipSpace(program.slice(1));
        } else if (program[0] != ")") {
            throw new SyntaxError("Expected ',' or ')'");
        }
    }

    return parseApply(expr, program.slice(1));
}

function parse(program) {
    let {expr, rest} = parseExpression(program);

    if (skipSpace(rest).length > 0) {
        throw new SyntaxError("Unexpected text after program");
    }

    return expr;
}
