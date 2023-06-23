import * as React from "react"

import sizeOf from "image-size"

export default function Image({ src, alt }) {
  const dimensions = sizeOf("./static/images/" + src)
  return (
    <img
      src={"/images/" + src}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
    />
  )
}
