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

    const prodPurchasesWithPricePerUnit = pricePerUnit(prodPurchases)

    console.log(subtractStock(3,prodPurchasesWithPricePerUnit))

    if (prodPurchasesWithPricePerUnit.length > 3) {
      
      // Calculate Mean Purchase Price
      let numberPurchased = 0;
      let pricePurchased = 0;
      for (i = 3; i < prodPurchasesWithPricePerUnit.length - 1; i += 2) {
        if (prodPurchasesWithPricePerUnit[i] && prodPurchasesWithPricePerUnit[i + 1]) {
          numberPurchased += prodPurchasesWithPricePerUnit[i];
          pricePurchased += prodPurchasesWithPricePerUnit[i + 1];
        }
      }
      let meanPurchasePrice = 0;
      if (numberPurchased != 0) {
        meanPurchasePrice = pricePurchased / numberPurchased;
      }

      for (i = 3; i < prodPharm.length - 1; i += 2) {
        
      }
      

      // console.log(prodEshop)
      // console.log(prodPharm)
      // console.log(prodPurchases)

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

subtractStock = (stock, productArray) => {
  let stockToSubtract = stock
  let purchaseSum = 0
  const productInfo = productArray.slice(0,3)
  const purchasesInfo = productArray.slice(3)

  // console.log(productInfo, purchasesInfo)
  for (i = 0; i < purchasesInfo.length - 1; i += 2) {
    if(stockToSubtract == 0) {
      break
    }

    if(purchasesInfo[i] && purchasesInfo[i+1]){
      if(stockToSubtract < purchasesInfo[i]){
        purchasesInfo[i] -= stockToSubtract 
        purchaseSum += stockToSubtract*purchasesInfo[i+1]
        stockToSubtract = 0
      } else {
        purchaseSum += purchasesInfo[i]
        *purchasesInfo[i+1]
        stockToSubtract -= purchasesInfo[i]
        purchasesInfo[i] = 0
        purchasesInfo[i+1] = 0
      }
    }
  }
  const newPurchasesArray = productInfo.concat(purchasesInfo)
  return {newPurchasesArray, purchaseSum}
} 

pricePerUnit = (purchaseArray) => {
  const productInfo = purchaseArray.slice(0,3)
  const purchasesInfo = purchaseArray.slice(3)
  for (i = 0; i < purchasesInfo.length - 1; i += 2) {
    if(purchasesInfo[i] && purchasesInfo[i+1]){
      purchasesInfo[i+1] /= purchasesInfo[i] 
    }
  }
  return productInfo.concat(purchasesInfo)
}