import { createCrossDocumentProgress, createProgress, Progress } from 'solid-route-progress'
import { REPO } from '~/links'
import { Panel, Readout, Row } from './ui'

/**
 * `<RouteProgress>` does this for you. Here it runs on its own, so the bar reacts only to
 * navigations that leave the document. It relies on the Navigation API, and where that is missing,
 * nothing happens.
 */
export function CrossDocument() {
  const progress = createProgress()
  createCrossDocumentProgress(progress)

  return (
    <Panel>
      <Progress
        controller={progress}
        class="absolute"
        label="Leaving the page"
        busyAttribute={false}
      />
      <Row>
        <a href={REPO} class="rounded-lg border border-border px-3 py-2 text-[13px]">
          Leave for GitHub: the bar holds until the browser hands over
        </a>
        <a href={REPO} data-sp-ignore class="rounded-lg border border-border px-3 py-2 text-[13px]">
          Same link with data-sp-ignore: nothing shows
        </a>
      </Row>
      <Readout>state: {progress.state()} · use the back button to come back</Readout>
    </Panel>
  )
}
