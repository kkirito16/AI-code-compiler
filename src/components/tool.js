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
        const result = fn.call(null, _require);
        return result.default || result;
    } catch (error) {
        console.error("代码执行出错:", error);
        return null;
    }
};