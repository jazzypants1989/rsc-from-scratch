export default function ColorChanger() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <form action="/api/color" id="color-changer" method="POST">
        <input
          type="color"
          name="color"
          id="color-selector"
          style={{ width: "50px", height: "50px" }}
        />
        <button type="submit">Change color</button>
      </form>
      <form action="/api/random" method="POST">
        <button type="submit">Random color</button>
      </form>
      <form action="/api/random?auto=true">
        <button type="submit">Random Color (no cookie)</button>
      </form>
      <form action="/api/delete" method="POST">
        <button type="submit">Delete cookie</button>
      </form>
    </div>
  )
}
