import React from "react"
      import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime"
      
      export const props = {"children":"LOL, my hydration strategy SUX","data-client":true,"data-component":"ClientOnly"}
      
      export const jsx = function ClientOnly({
  children
}) {
  const env = "use client";
  if (typeof window === "undefined") {
    return null;
  }
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    console.log("env", env);
  }, []);
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx("h3", {
      children: "Client Only"
    }), /*#__PURE__*/_jsx("button", {
      onClick: () => console.log("HEY WHATS UP"),
      children: "Console.log"
    }), /*#__PURE__*/_jsxs("button", {
      onClick: () => setCount(count + 1),
      children: ["Count: ", count]
    }), children]
  });
}
      