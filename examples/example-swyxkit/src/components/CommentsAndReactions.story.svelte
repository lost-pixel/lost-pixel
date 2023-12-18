
<script>

  import Reactions from './Reactions.svelte';
  import Comments from './Comments.svelte';
  import { sampleGHComments } from './_sampledata';
  export let Hst
</script>


<Hst.Story
  title="Comments"
  layout={{ type: 'grid', width: '100%' }}
>
  <Hst.Variant title="Full comments Example">
    <div class="mb-8">
      <Comments data={sampleGHComments} />
    </div>
  </Hst.Variant>
  <Hst.Variant title="full">
    <Reactions reactions={{
      total_count: 40,
      '+1': 5,
      '-1': 5,
      laugh: 5,
      hooray: 5,
      confused: 5,
      heart: 5,
      rocket: 5,
      eyes: 5,
    }}
    issueUrl="https://github.com/swyxio/swyxkit/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc"
    />
  </Hst.Variant>
  <Hst.Variant title="No reactions">
    <Reactions reactions={{
      total_count: 0,
      '+1': 0,
      '-1': 0,
      laugh: 0,
      hooray: 0,
      confused: 0,
      heart: 0,
      rocket: 0,
      eyes: 0,
    }}
    issueUrl="https://github.com/sw-yx/swyxkit/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc"
    />
    
  </Hst.Variant>
  <Hst.Variant title="Some">
    <Reactions reactions={{
      total_count: 21,
      '+1': 5,
      '-1': 4,
      laugh: 3,
      hooray: 2,
      confused: 1,
      heart: 0,
      rocket: 0,
      eyes: 0,
    }}
    issueUrl="https://github.com/sw-yx/swyxkit/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc"
    />
  </Hst.Variant>
</Hst.Story>
