import type { CSSProperties } from 'react'
import type { Project } from '../data'

/** Generated cover art. Swap for a real screenshot by adding an <img> here. */
export function ProjectArt({ project }: { project: Project }) {
  const style = { '--art': project.color } as CSSProperties
  return (
    <div className="art" style={style} aria-hidden="true">
      <span className="art-orb" />
      <span className="art-glyph depth" data-parallax="0.08">
        {project.title[0]}
      </span>
    </div>
  )
}
