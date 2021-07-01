const input = document.getElementById("input");

input.addEventListener("change", async () => {
  document.getElementById('results').innerHTML = '<br>Παρακαλώ περιμένετε...'
  let pharmFile, eshopFile, purchaseFile, abroadFile;
  let count = 0;
  async function matchFiles(files) {
    for (const file of files) {
      if (file.name == "pharm.xlsx") {
        pharmFile = await readXlsxFile(file);
        count += 1;
      }
      if (file.name == "eshop.xlsx") {
        eshopFile = await readXlsxFile(file);
        count += 1;
      }
      if (file.name == "agores.xlsx") {
        purchaseFile = await readXlsxFile(file);
        count += 1;
      }
      if (file.name == "abroad.xlsx") {
        abroadFile = await readXlsxFile(file);
        count += 1;
      }
      if (file.name == "yeb.xlsx") {
        yebFile = await readXlsxFile(file);
        count += 1;
      }
      if (file.name == "prods.xlsx") {
        prodsFile = await readXlsxFile(file);
        count += 1;
      }
    }
  }
  await matchFiles(input.files);

  if (count != 6) {
    // console.log("nope");
    document.getElementById('results').innerHTML = '<br>Τα αρχεία που ανεβάσατε δεν είναι σωστά'
    return;
  }

  eshopFile = eshopFile.slice(7);
  abroadFile = abroadFile.slice(7);
  pharmFile = pharmFile.slice(7);
  purchaseFile = purchaseFile.slice(7);
  prodsFile = prodsFile.slice(6);
  yebFile = yebFile.slice(1);

  // console.log(pharmFile, eshopFile, purchaseFile);

  let fullSaleSum = 0;
  let fullPurchaseSum = 0;
  let productsWithoutPurchases = [];
  let sellPriceWithoutPurchases = 0;
  for (prodEshop of eshopFile) {
    const productID = prodEshop[1];
    const prodAbroad = abroadFile.filter((arr) => arr[1] == productID)[0];
    const prodPharm = pharmFile.filter((arr) => arr[1] == productID)[0];
    const prodPurchases = purchaseFile.filter((arr) => arr[1] == productID)[0];
    let meanPurchasePrice = 0;

    if (prodPurchases) {
      let prodPurchasesWithPricePerUnit = pricePerUnit(prodPurchases);

      // console.log("Eshop", prodEshop);
      // console.log("Pharm", prodPharm);
      // console.log("Agores", prodPurchases);
      if (prodPurchasesWithPricePerUnit.length > 3) {
        // Calculate Mean Purchase Price
        let numberPurchased = 0;
        let pricePurchased = 0;
        for (i = 3; i < prodPurchasesWithPricePerUnit.length - 1; i += 2) {
          if (
            prodPurchasesWithPricePerUnit[i] &&
            prodPurchasesWithPricePerUnit[i + 1]
          ) {
            numberPurchased += prodPurchasesWithPricePerUnit[i];
            pricePurchased += prodPurchasesWithPricePerUnit[i + 1];
          }
        }
        if (numberPurchased != 0) {
          meanPurchasePrice = pricePurchased / numberPurchased;
        }

        // End of Mean Purchase Price Calculation

        // console.log("Eshop", prodEshop);
        // console.log("Abroad", prodAbroad);
        // console.log("Pharm", prodPharm);
        // console.log("Agores", prodPurchasesWithPricePerUnit);

        

        for (let i = prodEshop.length - 4; i > 2; i -= 2) {
          if (prodEshop[i] && prodEshop[i + 1]) {
            fullSaleSum += prodEshop[i + 1];
            const subtractionResult = subtractStock(
              prodEshop[i],
              prodPurchasesWithPricePerUnit,
              meanPurchasePrice,
              prodsFile,
              yebFile
            );
            fullPurchaseSum += subtractionResult.purchaseSum;
            prodPurchasesWithPricePerUnit = subtractionResult.newPurchasesArray;
            // console.log("Agores", prodPurchasesWithPricePerUnit);
          }
          if (prodAbroad) {
            if (prodAbroad[i] && prodAbroad[i + 1]) {
              fullSaleSum += prodAbroad[i + 1] * 2;
              const subtractionResult = subtractStock(
                prodAbroad[i],
                prodPurchasesWithPricePerUnit,
                meanPurchasePrice,
                prodsFile,
                yebFile
              );
              prodPurchasesWithPricePerUnit =
                subtractionResult.newPurchasesArray;
              fullPurchaseSum += subtractionResult.purchaseSum;
            }
          }
          if (prodPharm) {
            if (prodPharm[i] && prodPharm[i + 1]) {
              prodPurchasesWithPricePerUnit = subtractStock(
                prodPharm[i],
                prodPurchasesWithPricePerUnit,
                meanPurchasePrice,
                prodsFile,
                yebFile
              ).newPurchasesArray;
            }
          }
        }

        // console.log(fullPurchaseSum);
        // console.log("Eshop", prodEshop);
        // console.log("Abroad", prodAbroad);
        // console.log("Pharm", prodPharm);
        // console.log("Agores after", prodPurchasesWithPricePerUnit);
      }
    } else {
      let fullSellPrice = 0;
      let prodNumberWithoutPurchases = 0;

      for (let i = prodEshop.length - 2; i > 2; i -= 2) {
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
  const grossProfit = fullSaleSum - fullPurchaseSum;
  document.getElementById('results').innerHTML = `<br>Μείκτο κέρδος: <strong>${grossProfit.toFixed(2)} \u20AC</strong><br>
  Τζίρος χωρίς αντίστοιχες αγορές: <strong>${sellPriceWithoutPurchases.toFixed(2)} \u20AC</strong>`
  return
  // console.log(grossProfit);
  // console.log(`No purchase Sum: ${sellPriceWithoutPurchases}`);
  // console.log(productsWithoutPurchases);
});
calculateYEBdiscount = (productID, prodsFile, yebFile) => {
  let discount = 1;
  const productInfo = prodsFile.filter((productArray) => {
    return productArray[1] == productID;
  });
  const brand = productInfo[0][6];
  const yeb = yebFile.filter((brandArray) => {
    return brandArray[0] == brand;
  })[0];
  if (yeb) {
    discount = 1 - yeb[1] / 100;
  }
  return discount;
};
subtractStock = (
  stock,
  productArray,
  meanPurchasePrice,
  prodsFile,
  yebFile
) => {
  let stockToSubtract = stock;
  let purchaseSum = 0;
  const productInfo = productArray.slice(0, 3);
  const purchasesInfo = productArray.slice(3);
  const yebDiscount = calculateYEBdiscount(productArray[1], prodsFile, yebFile);
  // console.log(productInfo, purchasesInfo)
  for (let j = purchasesInfo.length - 4; j >= 0; j -= 2) {
    if (stockToSubtract == 0) {
      break;
    }
    if (purchasesInfo[j] && purchasesInfo[j + 1]) {
      if (stockToSubtract < purchasesInfo[j]) {
        purchasesInfo[j] -= stockToSubtract;
        purchaseSum += stockToSubtract * purchasesInfo[j + 1] * yebDiscount;
        stockToSubtract = 0;
      } else {
        purchaseSum += purchasesInfo[j] * purchasesInfo[j + 1] * yebDiscount;
        stockToSubtract -= purchasesInfo[j];
        purchasesInfo[j] = 0;
        purchasesInfo[j + 1] = 0;
      }
    } else if (purchasesInfo[j] > 0) {
      if (stockToSubtract < purchasesInfo[j]) {
        purchasesInfo[j] -= stockToSubtract;
        stockToSubtract = 0;
      } else {
        stockToSubtract -= purchasesInfo[j];
        purchasesInfo[j] = 0;
      }
    }
  }

  if (stockToSubtract > 0) {
    purchaseSum += stockToSubtract * meanPurchasePrice * yebDiscount;
    stockToSubtract = 0;
  }
  // console.log("purchaseSum", purchaseSum);
  const newPurchasesArray = productInfo.concat(purchasesInfo);
  return { newPurchasesArray, purchaseSum };
};

pricePerUnit = (purchaseArray) => {
  const productInfo = purchaseArray.slice(0, 3);
  const purchasesInfo = purchaseArray.slice(3);
  for (let i = purchasesInfo.length - 4; i >= 0; i -= 2) {
    if (purchasesInfo[i] && purchasesInfo[i + 1]) {
      purchasesInfo[i + 1] /= purchasesInfo[i];
    }
  }
  return productInfo.concat(purchasesInfo);
};
