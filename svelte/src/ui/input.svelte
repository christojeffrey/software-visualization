<script lang="ts">
    export let type: string;
    export let value: any;
    export let onChange: (e: any) => void;
</script>

<div>
    <input
			class="ml-4 border-2"
			type={type}
			min="1"
			max="100"
			value={value}
			on:change={onChange}
		/>
</div>