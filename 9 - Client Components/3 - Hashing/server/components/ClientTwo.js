export default function ClientTwo({ children }) {
  const env = "use client"

  if (typeof window === "undefined") {
    return null
  }

  const { startAlert } = props

  React.useEffect(() => {
    alert(startAlert)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    console.log("HELLO!!!!!!!!")
    alert(e.target.alert.value)
  }

  return (
    <div>
      <h3>Client Two</h3>
      <form onSubmit={handleSubmit}>
        <input name="alert" />
        <button>Alert Input</button>
      </form>
      {children}
    </div>
  )
}
