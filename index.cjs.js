var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
__export(exports, {
  default: () => vitePluginGlimmerX
});
var import_core = __toModule(require("@babel/core"));
var import_babel_preset = __toModule(require("@glimmerx/babel-preset"));
var import_preset_typescript = __toModule(require("@babel/preset-typescript"));
var import_parse_static_imports = __toModule(require("parse-static-imports"));
const templateFileRegex = /\.(hbs)$/;
const scriptFileRegex = /\.(ts|js)$/;
const fixDelimiter = "// [will-be-removed]";
function isNodeModulesPath(str) {
  return str.includes("node_modules");
}
function vitePluginGlimmerX(plgOptions) {
  let viteConfig;
  return {
    name: "vite:glimmerx",
    enforce: "pre",
    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },
    transform(rawCode, id) {
      let code = rawCode;
      if (templateFileRegex.test(id)) {
        code = `
          import { hbs } from '@glimmerx/component';
          export default hbs\`${rawCode.trim()}\`;
        `.trim();
      } else if (!scriptFileRegex.test(id)) {
        return;
      }
      if (!isNodeModulesPath(id)) {
        code = code.split("@glint/environment-glimmerx/").join("@glimmerx/");
      }
      const needPatch = !isNodeModulesPath(id);
      const imports = (0, import_parse_static_imports.default)(code).filter((e) => {
        return e.moduleName.startsWith("@glint/") || e.moduleName.startsWith("@glimmerx/") || !e.moduleName.startsWith("@");
      }).map((el) => [...el.namedImports.map((e) => e.alias), el.defaultImport]).reduce((acc, items) => {
        return acc.concat(items);
      }, []).filter((el) => el.length && el !== "hbs").map((e) => e.split(" ").pop().trim());
      code = needPatch ? `
        ${code};
        ${fixDelimiter}
        export const _params = [${imports.map((e) => `${e}`).join(",")}];
      ` : code;
      const result = transformSrcCode(code, id, plgOptions, viteConfig);
      return {
        code: needPatch ? result.split(fixDelimiter)[0].trim() : result,
        map: null
      };
    }
  };
}
function transformSrcCode(code, fileName, plgOptions, viteConfig) {
  let presets = [];
  if (isNodeModulesPath(fileName) || fileName.endsWith(".js")) {
    presets = [function(api, opts) {
      return (0, import_babel_preset.default)(api, {
        ...opts,
        ...{
          isDebug: !viteConfig.isProduction
        }
      });
    }];
  } else {
    presets = [import_preset_typescript.default, function(api, opts) {
      return (0, import_babel_preset.default)(api, {
        ...opts,
        ...{
          isDebug: !viteConfig.isProduction
        }
      });
    }];
  }
  let result = (0, import_core.transformSync)(code, {
    sourceType: "module",
    babelrc: false,
    configFile: false,
    envName: viteConfig.mode,
    filename: fileName,
    presets
  });
  return result.code;
}
