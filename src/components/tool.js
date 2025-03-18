import { transform } from "@babel/standalone";
import React from "react";
import ReactDOM from "react-dom";

const _require = (moduleName) => {
    const modules = {
        react: React,
        "react-dom": ReactDOM
    };
    if (modules[moduleName]) {
        return modules[moduleName];
    }
    throw new Error(
        `找不到'${moduleName}模块'，可选模块有：${Object.keys(modules).join(", ")}`
    );
};

export const evalCode = (code) => {
    let result = null;
    let error = null;
    try {
        const output = transform(code, { presets: ["es2015", "react"] }).code;
        const wrapperCode = `
            const module = { exports: {} };
            const exports = module.exports;
            var require = arguments[0];
            ${output}
            return module.exports;
        `;
        const fn = new Function(wrapperCode);
        result = fn.call(null, _require);
        result = result.default || result;
    } catch (e) {
        error = e;
    }
    return { result, error };
};