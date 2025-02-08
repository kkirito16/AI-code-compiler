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
    const output = transform(code, { presets: ["es2015", "react"] }).code;
    const fn = new Function(
        `var require = arguments[0], exports = arguments[1];\n ${output}`
    );
    const exports = {};
    fn.call(null, _require, exports);
    return exports.default;
};