const input = document.getElementById("input");

input.addEventListener("change", async () => {
  document.getElementById("results-eshop").innerHTML =
    "<br>Παρακαλώ περιμένετε...";
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
    document.getElementById("results-eshop").innerHTML =
      "<br>Τα αρχεία που ανεβάσατε δεν είναι σωστά";
    return;
  }

  eshopFile = eshopFile.slice(7);
  abroadFile = abroadFile.slice(7);
  pharmFile = pharmFile.slice(7);
  purchaseFile = purchaseFile.slice(7);
  yebFile = yebFile.slice(1);

  let newProdsFile = [];
  prodsFile = prodsFile.slice(6).forEach((arr) => {
    let newProdArray = [];
    newProdArray.push(arr[1]);
    newProdArray.push(arr[6]);
    newProdsFile.push(newProdArray);
  });


  const purchaseArrayLength = eshopFile[0].length;

  let fullSaleSumEshop = 0;
  let fullPurchaseSumEshop = 0;
  let fullSaleSumAbroad = 0;
  let fullPurchaseSumAbroad = 0;
  let fullSaleSumPharm = 0;
  let fullPurchaseSumPharm = 0;

  let productsWithoutPurchases = [];
  let sellPriceWithoutPurchases = 0;



  for (product of newProdsFile) {
    const productID = product[0];
    if (!/\d{6}/.test(productID)) {
      continue;
    }

    const prodEshop = eshopFile.filter((arr) => arr[1] == productID)[0];
    const prodAbroad = abroadFile.filter((arr) => arr[1] == productID)[0];
    const prodPharm = pharmFile.filter((arr) => arr[1] == productID)[0];
    const prodPurchases = purchaseFile.filter((arr) => arr[1] == productID)[0];

    if (prodPurchases) {
      let prodPurchasesWithPricePerUnit = pricePerUnit(prodPurchases);

      if (prodPurchasesWithPricePerUnit.length > 3) {
        const meanPurchasePrice = calculateMeanPurchasePrice(
          prodPurchasesWithPricePerUnit
        );

        for (let i = purchaseArrayLength - 4; i > 2; i -= 2) {
          if (prodEshop) {
            if (prodEshop[i] && prodEshop[i + 1]) {
              fullSaleSumEshop += prodEshop[i + 1];
              const subtractionResult = subtractStock(
                prodEshop[i],
                prodPurchasesWithPricePerUnit,
                meanPurchasePrice,
                product,
                yebFile
              );
              fullPurchaseSumEshop += subtractionResult.purchaseSum;
              prodPurchasesWithPricePerUnit =
                subtractionResult.newPurchasesArray;
            }
          }
          if (prodAbroad) {
            if (prodAbroad[i] && prodAbroad[i + 1]) {
              fullSaleSumAbroad += prodAbroad[i + 1] * 2;
              const subtractionResult = subtractStock(
                prodAbroad[i],
                prodPurchasesWithPricePerUnit,
                meanPurchasePrice,
                product,
                yebFile
              );
              prodPurchasesWithPricePerUnit =
                subtractionResult.newPurchasesArray;
                fullPurchaseSumAbroad += subtractionResult.purchaseSum;
            }
          }
          if (prodPharm) {
            if (prodPharm[i] && prodPharm[i + 1]) {
              fullSaleSumPharm += prodPharm[i + 1];
              const subtractionResult = subtractStock(
                prodPharm[i],
                prodPurchasesWithPricePerUnit,
                meanPurchasePrice,
                product,
                yebFile
              );
              prodPurchasesWithPricePerUnit =
                subtractionResult.newPurchasesArray;
              fullPurchaseSumPharm += subtractionResult.purchaseSum;
            }
          }
        }
      }
    } else {
      let fullSellPrice = 0;
      let prodNumberWithoutPurchases = 0;

      for (let i = purchaseArrayLength - 4; i > 2; i -= 2) {
        if (prodEshop) {
          if (prodEshop[i] && prodEshop[i + 1]) {
            fullSellPrice += prodEshop[i + 1];
            prodNumberWithoutPurchases += prodEshop[i];
          }
        }
        if (prodAbroad) {
          if (prodAbroad[i] && prodAbroad[i + 1]) {
            fullSellPrice += prodAbroad[i + 1];
            prodNumberWithoutPurchases += prodAbroad[i];
          }
        }
        if (prodPharm) {
          if (prodPharm[i] && prodPharm[i + 1]) {
            fullSellPrice += prodPharm[i + 1];
            prodNumberWithoutPurchases += prodPharm[i];
          }
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

  const grossProfitEshop = fullSaleSumEshop - fullPurchaseSumEshop;
  const grossProfitAbroad = fullSaleSumAbroad - fullPurchaseSumAbroad;
  const grossProfitPharm = fullSaleSumPharm - fullPurchaseSumPharm;

  document.getElementById(
    "results-eshop"
  ).innerHTML = `<br>Μεικτό κέρδος Eshop: <strong>${grossProfitEshop.toFixed(
    2
  )} \u20AC</strong><br>`;
  document.getElementById(
    "results-abroad"
  ).innerHTML = `<br>Μεικτό κέρδος εξωτερικού: <strong>${grossProfitAbroad.toFixed(
    2
  )} \u20AC</strong><br>`;
  document.getElementById(
    "results-eshop-complete"
  ).innerHTML = `<br>Σύνολο μεικτού κέρδους Eshop: <strong>${(grossProfitEshop+grossProfitAbroad).toFixed(
    2
  )} \u20AC</strong><br>`;
  document.getElementById(
    "results-pharm"
  ).innerHTML = `<br>Μεικτό κέρδος Φαρμακείου: <strong>${grossProfitPharm.toFixed(
    2
  )} \u20AC</strong><br>`;
  document.getElementById(
    "results-noPurchase"
  ).innerHTML = `<br>Τζίρος χωρίς αντίστοιχες αγορές: <strong>${sellPriceWithoutPurchases.toFixed(
    2
  )} \u20AC</strong>`;
  return;
});

calculateMeanPurchasePrice = (prodPurchasesWithPricePerUnit) => {
  let meanPurchasePrice = 0;
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
  return meanPurchasePrice;
};

calculateYEBdiscount = (product, yebFile) => {
  let discount = 1;
  const brand = product[1];
  const yeb = yebFile.filter((brandArray) => {
    return brandArray[0] == brand;
  })[0];
  if (yeb) {
    discount = 1 - yeb[1] / 100;
  }
  return discount;
};
subtractStock = (stock, productArray, meanPurchasePrice, product, yebFile) => {
  let stockToSubtract = stock;
  let purchaseSum = 0;
  const productInfo = productArray.slice(0, 3);
  const purchasesInfo = productArray.slice(3);
  const yebDiscount = calculateYEBdiscount(product, yebFile);

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
