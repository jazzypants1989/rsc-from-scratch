import React from "react"
    import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime"
    
    export const props = {"startAlert":"Hey dorkface! I'm alerting you right now!","children":"SHOUT IT OUT","data-client":true,"data-component":"ClientTwo"}
    
    export const jsx = function ClientTwo({
  children
}) {
  const env = "use client";
  if (typeof window === "undefined") {
    return null;
  }
  const {
    startAlert
  } = props;
  React.useEffect(() => {
    alert(startAlert);
  }, []);
  function handleSubmit(e) {
    e.preventDefault();
    console.log("HELLO!!!!!!!!");
    alert(e.target.alert.value);
  }
  return /*#__PURE__*/_jsxs("div", {
    children: [/*#__PURE__*/_jsx("h3", {
      children: "Client Two"
    }), /*#__PURE__*/_jsxs("form", {
      onSubmit: handleSubmit,
      children: [/*#__PURE__*/_jsx("input", {
        name: "alert"
      }), /*#__PURE__*/_jsx("button", {
        children: "Alert Input"
      })]
    }), children]
  });
}
    