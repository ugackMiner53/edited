
<style lang="scss">

  :global(html, body) {
    height: 100%;
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 18px;
  }
  
  .container {
    min-height: 100%;
    max-width:30rem;
  }

  .header {
    position: fixed;
    height: 15%;
    background-color: #efefef;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 1rem;
  }

  .pfp {
    padding: 1rem;
    font-size: 2rem;
    border-radius: 100%;
    background-color: grey;
    color: white;
    font-weight: bold;

  }
</style>


<div class="container">
  <div class="header">
    
    <span class="pfp">TL</span>
    <span class="name">Trenton Long</span>
    
  </div>

  <div class="messages">

  </div>
  
  <div class="messager">

    <!-- Enter message box here -->

    
    <div class="keyboard">

    </div>
  </div>

</div>
