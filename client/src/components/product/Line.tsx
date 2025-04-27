import type { SVGProps } from "react"

export function HorizontalLine(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 2"
      preserveAspectRatio="none"
      width="100%"
      height="2"
      {...props}
    >
      <line x1="0" y1="1" x2="100" y2="1" stroke="currentColor" />
    </svg>
  )
}

export function VerticalLine(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 2 100"
      preserveAspectRatio="none"
      width="2"
      height="100%"
      {...props}
    >
      <line x1="1" y1="0" x2="1" y2="100" stroke="currentColor" />
    </svg>
  )
}
