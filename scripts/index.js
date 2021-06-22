const input = document.getElementById("input");

input.addEventListener("change", async () => {
  let pharmFile, eshopFile, purchaseFile;
  async function matchFiles(files) {
    for (const file of files) {
      if (file.name == "pharm.xlsx") {
        pharmFile = await readXlsxFile(file);
      }
      if (file.name == "eshop.xlsx") {
        eshopFile = await readXlsxFile(file);
      }
      if (file.name == "agores.xlsx") {
        purchaseFile = await readXlsxFile(file);
      }
    }
  }
  await matchFiles(input.files);

  pharmFile = pharmFile.slice(7);
  eshopFile = eshopFile.slice(7, 10);
  purchaseFile = purchaseFile.slice(7);
  // console.log(pharmFile, eshopFile, purchaseFile);

  let fullGrossProfit = 0;
  let productsWithoutPurchases = [];
  let sellPriceWithoutPurchases = 0;

  for (prodEshop of eshopFile) {
    const productID = prodEshop[1];
    const prodPharm = pharmFile.filter((arr) => arr[1] == productID)[0];
    const prodPurchases = purchaseFile.filter((arr) => arr[1] == productID)[0];

    if (prodPurchases.length > 3) {
      let numberPurchased = 0;
      let pricePurchased = 0;
      for (i = 3; i < prodPurchases.length - 1; i += 2) {
        if (prodPurchases[i] && prodPurchases[i + 1]) {
          numberPurchased += prodPurchases[i];
          pricePurchased += prodPurchases[i + 1];
        }
      }
      let meanPurchasePrice = 0;
      if (numberPurchased != 0) {
        meanPurchasePrice = pricePurchased / numberPurchased;
      }


    } else {
      let fullSellPrice = 0;
      let prodNumberWithoutPurchases = 0;

      for (i = 3; i < prodEshop.length - 1; i += 2) {
        if (prodEshop[i] && prodEshop[i + 1]) {
          fullSellPrice += prodEshop[i + 1];
          prodNumberWithoutPurchases += prodEshop[i];
        }
      }

      sellPriceWithoutPurchases += fullSellPrice;
      productsWithoutPurchases.push({
        ID: productID,
        Number: prodNumberWithoutPurchases,
        Sum: fullSellPrice,
      });
    }
  }
  // console.log(`Gross Profit: ${fullGrossProfit}`)
  // console.log(`No purchase Sum: ${sellPriceWithoutPurchases}`);
  // console.log(productsWithoutPurchases);
});
