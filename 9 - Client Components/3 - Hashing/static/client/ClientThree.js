import React from "react"
    import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime"
    
    export const props = {"data-client":true,"data-component":"ClientThree"}
    
    export const jsx = function ClientThree({
  children
}) {
  const env = "use client";
  if (typeof window === "undefined") {
    return null;
  }
  const cookie = document.cookie;
  const colorCookie = cookie.slice(cookie.indexOf("=") + 1);
  return /*#__PURE__*/_jsxs("div", {
    children: [/*#__PURE__*/_jsx("p", {
      children: "Color Saved In Cookie? -- "
    }), /*#__PURE__*/_jsx("p", {
      id: "cookie-display",
      children: colorCookie ? colorCookie : "No Color Saved Currently"
    })]
  });
}
    