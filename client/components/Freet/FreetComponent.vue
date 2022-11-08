<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="freet"
  >
    <header>
      <h3 class="author">
        @{{ freet.author }}
      </h3>
      <div
        v-if="$store.state.username === freet.author"
        class="actions"
      >
        <button
          v-if="editing"
          @click="submitEdit"
        >
          ✅ Save changes
        </button>
        <button
          v-if="editing"
          @click="stopEditing"
        >
          🚫 Discard changes
        </button>
        <button
          v-if="!editing && !tagging && !flagging"
          @click="startEditing"
        >
          ✏️ Edit
        </button>
        <button
          v-if="!editing && !tagging && !flagging"
          @click="startTagging"
        >
          🏷️ Edit Tags
        </button>
        <button 
          v-if="tagging"
          @click="addTag">
          ✅ Add Tag
        </button>
        <button 
          v-if="tagging"
          @click="removeTag">
          ❌ Remove Tag
        </button>
        <button
          v-if="tagging"
          @click="stopTagging"
        >
          🚫 Discard changes
        </button>

        <button
          v-if="!editing && !tagging && !flagging && !hasFlag"
          @click="startFlagging"
        >
          🚩 Add Flag
        </button>
        <button 
          v-if="flagging"
          @click="addFlag">
          ✅ Submit Flag
        </button>
        <button 
          v-if="!editing && !tagging && !flagging && hasFlag"
          @click="deleteFlag">
          ❌ Delete Flag
        </button>
        <button
          v-if="flagging"
          @click="stopFlagging"
        >
          🚫 Discard changes
        </button>

        <button 
          v-if="!tagging && !flagging"
          @click="deleteFreet">
          🗑️ Delete Freet
        </button>
      </div>
    </header>
    <div class="content-area">
        <textarea
        v-if="editing"
        class="content-area"
        :value="draft"
        @input="draft = $event.target.value"
      />
      <input
        v-if="tagging"
        class="content" 
        :value="draftTag"
        @input="draftTag = $event.target.value"
      />
      <input
        v-if="flagging"
        class="content" 
        :value="draftFlag"
        @input="draftFlag = $event.target.value"
      />
      <p
        v-if="!editing"
        class="content"
      >
        {{ freet.content }}
      </p>
    </div>
    
    
    <section class="tags"
        v-if="freet.tags.length"
      >
        <TagComponent
          v-for="tag in freet.tags"
          :key="tag"
          :tagId="tag.toString()"
        />
    </section>
    <section
        v-if="freet.flags.length"
      >
        <FlagComponent
          v-for="flag in freet.flags"
          :key="flag"
          :flagId="flag.toString()"
        />
        <span
        v-if="$store.state.username && $store.state.username !== freet.author"
          >
            <button
              @click="challengeFlag"
            >
            🤔 Challenge Flag
          </button>
      </span>
    </section>
    <p class="info date">
      Posted at {{ freet.dateModified }}
      <i v-if="freet.edited">(edited)</i>
    </p>
    <section class="alerts">
      <article
        v-for="(status, alert, index) in alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
  </article>
</template>

<script>
import TagComponent from '@/components/Tag/TagComponent.vue';
import FlagComponent from '@/components/Flag/FlagComponent.vue';
export default {
  name: 'FreetComponent',
  components: {TagComponent, FlagComponent},
  props: {
    // Data from the stored freet
    freet: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      editing: false, // Whether or not this freet is in edit mode
      tagging: false,
      flagging: false,
      hasFlag: this.freet.flags.length ? true : false,
      draft: this.freet.content, // Potentially-new content for this freet
      draftTag: '',
      draftFlag: '',
      alerts: {} // Displays success/error messages encountered during freet modification
    };
  },
  methods: {
    startEditing() {
      /**
       * Enables edit mode on this freet.
       */
      this.editing = true; // Keeps track of if a freet is being edited
      this.draft = this.freet.content; // The content of our current "draft" while being edited
    },
    startTagging() {
      /**
       * Enables tagging mode on this freet.
       */
      this.tagging = true; 
      this.draftTag = ''; 
    },
    startFlagging() {
      /**
       * Enables flagging mode on this freet.
       */
      this.flagging = true; 
      this.draftSource = '';
    },
    stopEditing() {
      /**
       * Disables edit mode on this freet.
       */
      this.editing = false;
      this.draft = this.freet.content;
    },
    stopTagging() {
      /**
       * Disables edit tag mode on this freet.
       */
      this.tagging = false;
    },
    stopFlagging() {
      /**
       * Disables edit flag mode on this freet.
       */
      this.flagging = false;
    },
    deleteFreet() {
      /**
       * Deletes this freet.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted freet!', status: 'success'
          });
        }
      };
      this.request(params);
    },
    deleteFlag() {
      /**
       * Deletes this flag.
       */
      const params = {
        method: 'DELETE',
        message: 'Successfully deleted flag!',
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.requestDeleteFlag(params);
    },
    submitEdit() {
      /**
       * Updates freet to have the submitted draft content.
       */
      if (this.freet.content === this.draft) {
        const error = 'Error: Edited freet content should be different than current freet content.';
        this.$set(this.alerts, error, 'error'); // Set an alert to be the error text, timeout of 3000 ms
        setTimeout(() => this.$delete(this.alerts, error), 3000);
        return;
      }

      const params = {
        method: 'PATCH',
        message: 'Successfully edited freet!',
        body: JSON.stringify({content: this.draft}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.request(params);
    },
    async request(params) {
      /**
       * Submits a request to the freet's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      if (params.body) {
        options.body = params.body;
      }

      try {
        const r = await fetch(`/api/freets/${this.freet._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.editing = false;
        this.$store.commit('refreshFreets');

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },

    addTag() {
      /**
       * Updates freet's tags to include the submitted tag'.
       */
      const params = {
        method: 'PUT',
        message: 'Successfully added tag!',
        body: JSON.stringify({tag: this.draftTag}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.requestAddTag(params);
    },

    async requestAddTag(params) {
      /**
       * Submits a request to the tag's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      if (params.body) {
        options.body = params.body;
      }
      
      try {
        const r = await fetch(`/api/tags/add/${this.freet._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.tagging = false;
        this.$store.commit('refreshFreets');
        this.$store.commit('refreshTags');

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },

    removeTag() {
      /**
       * Updates freet's tags to remove the submitted tag'.
       */
      const params = {
        method: 'PUT',
        message: 'Successfully removed tag!',
        body: JSON.stringify({tag: this.draftTag}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      console.log("params");
      console.log(params);      
      this.requestRemoveTag(params);
    },

    async requestRemoveTag(params) {
      /**
       * Submits a request to the tag's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      if (params.body) {
        options.body = params.body;
      }
      
      try {
        const r = await fetch(`/api/tags/remove/${this.freet._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.tagging = false;
        this.$store.commit('refreshFreets');
        this.$store.commit('refreshTags');

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },

    addFlag() {
      /**
       * Add flag to freet'.
       */
      const params = {
        method: 'POST',
        message: 'Successfully added flag!',
        body: JSON.stringify({freetId: this.freet._id, source: this.draftFlag}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.requestAddFlag(params);
    },

    async requestAddFlag(params) {
      /**
       * Submits a request to the tag's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      if (params.body) {
        options.body = params.body;
      }
      
      try {
        const r = await fetch(`/api/flags`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.flagging = false;
        this.hasFlag = true;
        this.$store.commit('refreshFreets');
        this.$store.commit('refreshFlags');

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },

    async requestDeleteFlag(params) {
      /**
       * Submits a request to the tag's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      if (params.body) {
        options.body = params.body;
      }
      
      try {
        const r = await fetch(`/api/flags/${this.freet.flags[0].toString()}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.flagging = false;
        this.hasFlag = false;
        this.draftFlag = '';
        this.$store.commit('refreshFreets');
        // this.$store.commit('refreshFlags');

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },

    checkHasFlag() {
      this.hasFlag = (this.freet.flags.length > 0) ? true : false;
    },

    async challengeFlag() {
      const params = {
                method: 'PUT',
                message: 'Successfully challenged flag!',
                callback: () => {
                this.$set(this.alerts, params.message, 'success');
                setTimeout(() => this.$delete(this.alerts, params.message), 3000);
                }
            };
            const options = {
                method: params.method, headers: {'Content-Type': 'application/json'}
            };
            try {
                const r2 = await fetch(`/api/flags/challenge/${this.freet.flags[0].toString()}`, options);
                if (!r2.ok) {
                const res2 = await r2.json();
                throw new Error(res2.error);
                }
        this.$store.commit('refreshFreets');

                params.callback();
            } catch (e) {
                this.$set(this.alerts, e, 'error');
                setTimeout(() => this.$delete(this.alerts, e), 3000);
            }
    }

  },
  mounted() {
    this.checkHasFlag()
  }
};


</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400&family=Shadows+Into+Light&display=swap');
.freet {
    border: 1px solid grey;
    border-radius: 10px;
    padding: 20px;
    position: relative;
    background-color: aliceblue;
}

.date {
  font-style: italic;
}

button {
  /* display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start; */
  margin-right: 3px;
}

.content-area {
  margin-top: 10px;
  font-family: 'Lato', sans-serif;
  font-size: 18px;
}

.tags {
  display: flex;
  flex-direction: row;
  gap: 5px;
}
</style>
