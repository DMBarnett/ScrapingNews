
console.log("hello world")

$.get("/articles", function(data){
  console.log(data);
  let count = 0;
  data.forEach(element => {
    let newCard = $("<div>").attr("class", "card");
    newCard.attr("data-id", count);

    let innerCard = $("<div>").attr("class", "card-body");

    let link = $("<a>").attr("href", element.link).text(element.title)
    let innerH1 = $("<h1>").append(link);

    let innerBlurb = $("<h4>").text(element.blurb);

    innerCard.append(innerH1);
    innerCard.append(innerBlurb);
    newCard.append(innerCard);
    $("#main-card-fill").append(newCard);
    count++;
  });
})
