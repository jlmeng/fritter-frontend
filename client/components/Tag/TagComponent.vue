<template>
    <div class="tag">
        <p>
            {{this.content}}
        </p>
    </div>
</template>

<script>
export default {
  name: 'TagComponent',
  props: {tagId: {
    type: String,
    required: true
  }},
  data() {
    return {
        content: ''
    };
  },
  methods: {
    tagIdToContent() {
        /**
         * Converts a tag ID to the corresponding tag's content.
         */
        for (var tag in this.$store.state.tags) {
            if (this.$store.state.tags[tag].id === this.tagId) {
                this.content = this.$store.state.tags[tag].content;
            }
        }
    }
  },
  mounted() {
    this.tagIdToContent()
  }
};
</script>

<style scoped>

.tag {
    border: 0px solid grey;
    font-size: 12px;
    border-radius: 10px;
    padding: 0 10px;
    width: fit-content;
    height: inherit;
    position: relative;
    background-color: #fdcc95;
}
</style>