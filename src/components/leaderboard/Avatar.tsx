import { avatarFor } from '../../game/identity.ts'

/** Small coloured circle with initials — colour hashed from the device id. */
export default function Avatar({
  deviceId,
  name,
  size = 32,
}: {
  deviceId: string
  name: string
  size?: number
}) {
  const { bg, fg, initials } = avatarFor(deviceId, name)
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full font-bold leading-none"
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: Math.round(size * 0.4),
      }}
    >
      {initials}
    </span>
  )
}
