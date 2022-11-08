<template>
    <div class="flag">
        <p class="flag-text">
            Fact-checked ✔️ &nbsp source: &nbsp{{this.source}}, &nbsp challenges: &nbsp{{this.challenges}}
        </p>

    </div>
</template>

<script>
export default {
  name: 'FlagComponent',
  props: {flagId: {
    type: String,
    required: true
  }},
  data() {
    return {
        source: '',
        challenges: 0
    };
  },
  methods: {
    flagIdToContent() {
        /**
         * Converts a flag ID to the corresponding flag's source and challenges.
         */
        for (var flag in this.$store.state.flags) {
            if (this.$store.state.flags[flag].id === this.flagId) {
                this.source = this.$store.state.flags[flag].source;
                this.challenges = this.$store.state.flags[flag].challenges;
            }
        }
    }
  },
  mounted() {
    this.flagIdToContent()
  }
};
</script>

<style>
.flag {
    border: 0px solid grey;
    font-size: 12px;
    border-radius: 10px;
    padding: 0 10px;
    width: fit-content;
    height: inherit;
    position: relative;
    background-color: #efefef;
}

.flag-text {
    font-size: 15px;
}
</style>

