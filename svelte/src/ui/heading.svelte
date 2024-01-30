<script lang="ts">
    export let headingNumber: number = 4;

let styleClass: string;
// from 1 to 6
switch (headingNumber) {
    case 1:
        styleClass = "text-4xl font-bold";
        break;
    case 2:
        styleClass = "text-3xl font-bold";
        break;
    case 3:
        styleClass = "text-2xl font-bold";
        break;
    case 4:
        styleClass = "text-xl font-bold";
        break;
    case 5: 
        styleClass = "text-lg font-bold";
        break;
    case 6:
        styleClass = "text-base font-bold";
        break;
}
</script>
<div>
    <p class={`${styleClass} ${$$props.class}`}>
        <slot/>
    </p>
</div>