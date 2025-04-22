<script lang="ts">

  const { name } : { name : string } = $props();
  
  function pickBestLetters() {
    const words = name.toUpperCase().split(" ");

    if (name.startsWith("Lobby ")) {
      return "LB";
    }

    if (words.length > 1) {
      if (words[1] == "&") return "G";
      return words[0].charAt(0) + words[1].charAt(0);
    } else if (words[0].length > 1) {
      return words[0].slice(0, 2);
    } else {
      return words[0].charAt(0);
    }
  }
</script>

<style lang="scss">

  .header {
    flex: 2 0 20vh;
    background-color: #efefef;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0.5rem 0 0.5rem 0;
    gap: 0.5rem;
    text-align: center;
  }

  .pfp {
    padding: 1rem;
    font-size: 2rem;
    border-radius: 100%;
    aspect-ratio: 1/1;
    background-color: grey;
    color: white;
    font-weight: bold;
    line-height: 1.5;
  }

</style>

<div class="header">
  
  <span class="pfp">{pickBestLetters()}</span>
  <span class="name">{name}</span>
  
</div>
