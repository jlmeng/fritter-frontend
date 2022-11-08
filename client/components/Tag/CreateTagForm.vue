<!-- Form for creating tags (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'CreateTagForm',
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/tags',
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'tag', label: 'Tag', value: ''}
      ],
      title: 'Create a tag',
      callback: () => {
        const message = 'Successfully created a tag!';
        this.$store.commit('refreshTags');
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);
      }
    };
  }
};
</script>
