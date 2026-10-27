import { SPRITE_DEFS } from './sprite-markup'

/** Hidden sprite with every icon and the ambulance figure, referenced via <use>. */
export function SvgSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs dangerouslySetInnerHTML={{ __html: SPRITE_DEFS }} />
    </svg>
  )
}
