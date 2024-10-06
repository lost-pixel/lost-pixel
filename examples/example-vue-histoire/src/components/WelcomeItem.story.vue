<script setup>
import WelcomeItem from "./WelcomeItem.vue";
</script>

<template>
  <Story>
    <Variant title="Documentation">
      <WelcomeItem icon="/icons/documentation.svg">
        <template #heading>Documentation</template>

        Vue’s
        <a href="https://vuejs.org/" target="_blank" rel="noopener">official documentation</a>
        provides you with all information you need to get started.
      </WelcomeItem>
    </Variant>

    <Variant title="Community">
      <WelcomeItem icon="/icons/community.svg">
        <template #heading>Community</template>

        Got stuck? Ask your question on
        <a href="https://chat.vuejs.org" target="_blank" rel="noopener">Vue Land</a>, our official
        Discord server, or
        <a href="https://stackoverflow.com/questions/tagged/vue.js" target="_blank" rel="noopener"
          >StackOverflow</a
        >. You should also subscribe to
        <a href="https://news.vuejs.org" target="_blank" rel="noopener">our mailing list</a> and follow
        the official
        <a href="https://twitter.com/vuejs" target="_blank" rel="noopener">@vuejs</a>
        twitter account for latest news in the Vue world.
      </WelcomeItem>
    </Variant>
  </Story>
</template>
