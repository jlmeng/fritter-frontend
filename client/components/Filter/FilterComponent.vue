<!-- Reusable component for a form in an inline style (input and button on same line) -->
<!-- This is just an example; feel free to define any reusable components you want! -->

<template>
    <article>
      <input
        v-model="draftAuthor"
        type="text"
        :placeholder="'Filter by author'"
      >
      <input
        v-model="draftTag"
        type="text"
        :placeholder="'Filter by tag'"
      >
      <button
        @click="filterFeed"
      >
        View Freets
      </button>
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
  export default {
    name: 'FilterComponent',
    data() {
      return {
        draftAuthor: '', 
        draftTag: '',
        feed: null,
        alerts: {}
        };
    },
    methods: {
        async filterFeed() {
            /**
             * Creates a filtered feed with the given author and/or tag
             */
            if (this.draftAuthor !== '' && this.draftTag !== '') {
                await this.createFeed().then(()=>this.addUser()).then(()=>this.addTag()).then(()=>this.getFeed());
            } else if (this.draftAuthor !== '') {
                await this.createFeed().then(()=>this.addUser()).then(()=>this.getFeed());
            } else if (this.draftTag !== '') {
                await this.createFeed().then(()=>this.addTag()).then(()=>this.getFeed());
            } else {
                await this.createFeed().then(()=>this.getFeed());
            }
            
        },

        async createFeed() {
            /**
             * Creates a new feed.
             */
             const params = {
                method: 'POST',
                message: 'Successfully created feed!',
                callback: () => {
                this.$set(this.alerts, params.message, 'success');
                setTimeout(() => this.$delete(this.alerts, params.message), 3000);
                }
            };
            const options = {
                method: params.method, headers: {'Content-Type': 'application/json'}
            };
            try {
                const r = await fetch(`/api/feeds`, options);
                if (!r.ok) {
                    throw new Error(res.error);
                }
                const res = await r.json();
                this.feed = res.feed
                console.log("feed from 1", this.feed)
                // callback();
            } catch (e) {
                this.$set(this.alerts, e, 'error');
                setTimeout(() => this.$delete(this.alerts, e), 3000);
            }
        },
        
        async addUser() {
            /**
             * Adds a user to the feed 
             */
            console.log(1)
             const params = {
                method: 'PUT',
                message: 'Successfully added user!',
                body: JSON.stringify({username: this.draftAuthor}),
                callback: () => {
                this.$set(this.alerts, params.message, 'success');
                setTimeout(() => this.$delete(this.alerts, params.message), 3000);
                }
            };
            const options = {
                method: params.method, headers: {'Content-Type': 'application/json'}
            };
            if (params.body) {
                options.body = params.body;
            }
            try {
                console.log(this.feed._id.toString())
                console.log(options.body)
                const r2 = await fetch(`/api/feeds/adduser/${this.feed._id.toString()}`, options);
                console.log(2)
                
                if (!r2.ok) {
                const res2 = await r2.json();
                throw new Error(res2.error);
                }
                console.log("past user")
                // callback();
            } catch (e) {
                this.$set(this.alerts, e, 'error');
                setTimeout(() => this.$delete(this.alerts, e), 3000);
            }
        },

        async addTag() {
            /**
             * Adds a tag to the feed
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
            const options = {
                method: params.method, headers: {'Content-Type': 'application/json'}
            };
            if (params.body) {
                options.body = params.body;
            }
            try {
                const r2 = await fetch(`/api/feeds/addtag/${this.feed._id.toString()}`, options);
                if (!r2.ok) {
                const res2 = await r2.json();
                throw new Error(res2.error);
                }
                // callback();
            } catch (e) {
                this.$set(this.alerts, e, 'error');
                setTimeout(() => this.$delete(this.alerts, e), 3000);
            }
        },

        async getFeed() {
            /**
             * Gets feed with the current filter applied.
             */
             const params = {
                method: 'GET',
                callback: () => {
                this.$set(this.alerts, params.message, 'success');
                setTimeout(() => this.$delete(this.alerts, params.message), 3000);
                }
            };
            const options = {
                method: params.method, headers: {'Content-Type': 'application/json'}
            };

            try {
                const r2 = await fetch(`/api/feeds/${this.feed._id.toString()}`, options);
                if (!r2.ok) {
                throw new Error(res2.error);
                }
                const res2 = await r2.json();

                console.log(res2);
                if (this.draftAuthor !== '' && this.draftTag !== '') {
                    this.$store.commit('updateFilter', `${this.draftAuthor} with tag ${this.draftTag}`);
                } else if (this.draftAuthor !== '') {
                    this.$store.commit('updateFilter', `${this.draftAuthor}`);
                } else if (this.draftTag !== '') {
                    this.$store.commit('updateFilter', `everyone with tag ${this.draftTag}`);
                } else {
                    this.$store.commit('updateFilter', ``);
                }
                this.$store.commit('updateFreets', res2);
                // callback();
            } catch (e) {
                this.$set(this.alerts, e, 'error');
                setTimeout(() => this.$delete(this.alerts, e), 3000);
            }

        }
    }
  };
  </script>
  
  <style scoped>
  form {
      display: flex;
      position: relative;
  }

  article {
    display: flex;
    position: relative;
    flex-direction: row;
    padding-bottom: 10px;
    margin-right: 5px;
  }
  
  input {
      padding: 0 5px;
      min-width: 200px;
      margin-right: 5px;
  }
  </style>
  