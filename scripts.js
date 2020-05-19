var resp = [];
let categoryArray = [];
let shoppingCart;
let quantAmnt;
let cartSubtotal = [];
let cartTotal;
let contactInfo = [];
let orderHistory = [];
let orderOption = 'Pickup';

function updateContactInfo() {
  const firstName = $('input#update-first-name').val();
  const lastName = $('input#update-last-name').val();
  const phoneNumber = $('input#update-phone-number').val();
  const email = $('input#update-email-address').val();
  const streetAddress1 = $('input#update-street-address1').val();
  const streetAddress2 = $('input#update-street-address2').val();
  const city = $('input#update-city').val();
  const state = $('input#update-state').val();
  const zipCode = $('input#update-zip-code').val();
  contactInfo = [];
  contactInfo.push({ 'firstName': firstName, 'lastName': lastName, 'phoneNumber': phoneNumber, 'email': email, 'streetAddress1': streetAddress1, 'streetAddress2': streetAddress2, 'city': city, 'state': state, 'zipCode': zipCode });
  let stringContactInfo = JSON.stringify(contactInfo);
  //saves shopping cart to localStorage
  window.localStorage.setItem('contactInfo', stringContactInfo);
  //Updates contact info at checkout
  document.getElementById('first-name').setAttribute('value', firstName);
  document.getElementById('last-name').setAttribute('value', lastName);
  document.getElementById('phone-number').setAttribute('value', phoneNumber);
  document.getElementById('email-address').setAttribute('value', email);
  document.getElementById('street-address1').setAttribute('value', streetAddress1);
  document.getElementById('street-address2').setAttribute('value', streetAddress2);
  document.getElementById('city').setAttribute('value', city);
  document.getElementById('state').setAttribute('value', streetAddress2);
  document.getElementById('zip-code').setAttribute('value', zipCode);
}

function getCartTotal() {
  cartSubtotal = [];
  shoppingCart.forEach(element => {
    let subtotal = element.price;
    cartSubtotal.push(subtotal);
  })
  let sum = cartSubtotal.reduce(function (a, b) {
    return (+a) + (+b);
  }, 0);
  cartTotal = sum;
}

function updateLocalStorageCart() {
  const cartItems = shoppingCart.filter(item => item.qty > 0);
  //converts shoppingCart to string
  var stringRepresentingShoppingCartArray = JSON.stringify(cartItems);
  //saves shopping cart to localStorage
  window.localStorage.setItem('shoppingCart', stringRepresentingShoppingCartArray);
}

function submitOrder() {
  let firstName = $('input#first-name').val();
  let lastName = $('input#last-name').val();
  let phoneNumber = $('input#phone-number').val();
  let email = $('input#email-address').val();
  let streetAddress1 = $('input#street-address1').val();
  let streetAddress2 = $('input#street-address2').val();
  let city = $('input#city').val();
  let state = $('input#state').val();
  let zipCode = $('input#zip-code').val();
  let canPayPin = $('input#canPayPin').val();
  let noteToRetailer = orderOption + ', Note: ' + $('input#notetoretailer').val();
  contactInfo = [];
  let orderSubmission;
  contactInfo.push({ 'firstName': firstName, 'lastName': lastName, 'phoneNumber': phoneNumber, 'email': email, 'streetAddress1': streetAddress1, 'streetAddress2': streetAddress2, 'city': city, 'state': state, 'zipCode': zipCode, 'phone': phoneNumber, 'email': email });

  if (orderOption === 'Pickup') {
    streetAddress1 = '_';
    streetAddress2 = '_';
    city = '_';
    state = '_';
    zipCode = '_';
  }


  if ($('#canPayPayment').is(':checked')) {
    orderSubmission = JSON.stringify({
      'notetoretailer': noteToRetailer,
      'webguid': webguid,
      'customer': {
        'name': firstName + ' ' + lastName,
        'address1': streetAddress1,
        'address2': streetAddress2,
        'city': city,
        'state': state,
        'zip': zipCode,
        'email': email,
        'phone': phoneNumber
      },
      "payment": {
        "paymentToken": canPayPin,
        "orderTotal": cartTotal
      },
      'orderitems': shoppingCart
    });
  } else {
    orderSubmission = JSON.stringify({
      'notetoretailer': noteToRetailer,
      'webguid': webguid,
      'customer': {
        'name': firstName + ' ' + lastName,
        'address1': streetAddress1,
        'address2': streetAddress2,
        'city': city,
        'state': state,
        'zip': zipCode,
        'email': email,
        'phone': phoneNumber
      },
      'orderitems': shoppingCart
    });
  }

  $.ajax({
    url: 'https://api.marijuanasoftwarellc.com/v1/PostOnlineOrder?webguid=' + webguid,
    beforeSend: function (xhrObj) {
      xhrObj.setRequestHeader('Ocp-Apim-Subscription-Key', ocpApimSubscriptionKey);
    },
    type: 'POST',
    datatype: 'JsonArrayAttribute',
    contentType: 'application/json',
    data: orderSubmission,
    success: function (resp) {
      if (resp.transID === 0 && $('#canPayPayment').is(':checked')) {
        $("#cartMessage").append("<p>Bad CanPay Pin. Please Retry.</p>");
      } else {
        // resp.created = resp.created.toDateString();
        if (orderHistory === null || orderHistory === undefined) {
          var stringRepresentingSubmittedOrder = JSON.stringify(resp);
          //saves shopping cart to localStorage
          window.localStorage.setItem('orderHistory', stringRepresentingSubmittedOrder);
        } else {
          orderHistory.push(resp)
          var stringRepresentingSubmittedOrder2 = JSON.stringify(orderHistory);
          //saves shopping cart to localStorage
          window.localStorage.setItem('orderHistory', stringRepresentingSubmittedOrder2);
        }
        if ($('#saveContactInfo').is(':checked')) {
          var stringContactInfo = JSON.stringify(contactInfo);
          //saves shopping cart to localStorage
          window.localStorage.setItem('contactInfo', stringContactInfo);
        }
        shoppingCart = [];
        var stringRepresentingShoppingCartArray = JSON.stringify(shoppingCart);
        //saves shopping cart to localStorage
        window.localStorage.setItem('shoppingCart', stringRepresentingShoppingCartArray);
        const cartItems = shoppingCart.filter(item => item.qty > 0);
        document.getElementById('cartItemNumber').innerHTML = '(' + cartItems.length + ')';
        $('.shoppingCartPopup-overlay, .shoppingCartPopup-content').removeClass('active');
        $('.contactFormArea').addClass('hidden');
        $('.cartButtons').removeClass('hidden');
        $('.empty-cart').removeClass('hidden');
        $('.check-out').addClass('hidden');
        $('#shoppingCartModal').removeClass('hidden');
        alert('Order Submitted');
        document.getElementById('canPayPin').value = '';
      }
    },
    error: function (error) {
      console.log(error);
      if ($('#canPayPayment').is(':checked')) {
        $("#cartMessage").append("<p>Bad CanPay Pin. Please Retry.</p>");
      } else {
        $("#cartMessage").append("<p>Order Not Submitted. Please Try Again.");
      }
    }
  });
}

function updateOrder(obj, amount) {
  let price = '';
  if (amount === '1/8oz') {
    price = obj.EightPrice;
  }
  else if (amount === '1/4oz') {
    price = obj.QuaterOzPrice;
  }
  else if (amount === '1/2oz') {
    price = obj.HalfOzPrice;
  }
  else if (amount === '1oz') {
    price = obj.OzPrice;
  } else {
    price = obj.price;
  }
  let duplicates = false;
  if (amount === undefined || amount === null) {
    amount = '';
  }
  const productName = obj.name + ' ' + amount;
  let tag;
  if (obj.sku === null || obj.sku === undefined) {
    tag = 'undefined';
  } else {
    tag = obj.sku;
  }
  if (shoppingCart === undefined || shoppingCart === null) {
    shoppingCart.push({ name: productName, qty: 1, price, tag });
  } else {
    shoppingCart.forEach(element => {
      if (element.name.includes(productName)) {
        element.qty = element.qty + 1;
        element.price = element.qty * price;
        element.tag = tag;
        duplicates = true;
      }
    })
    if (duplicates === false) {
      const one = 1;
      shoppingCart.push({ name: productName, qty: one, price, tag });
    }
  }
  //converts shoppingCart to string
  var stringRepresentingShoppingCartArray = JSON.stringify(shoppingCart);
  //saves shopping cart to localStorage
  window.localStorage.setItem('shoppingCart', stringRepresentingShoppingCartArray);
  const cartItems = shoppingCart.filter(item => item.qty > 0);


  document.getElementById('cartItemNumber').innerHTML = '(' + cartItems.length + ')';

}



function showAllItems() {

  const menuBody = document.getElementById('menuBody');
  const showAllButton = document.getElementById('showAll');


  showAllButton.classList.add('active');
  menuBody.innerHTML = '';
  categoryArray.forEach(item => {
    getMenu(item)
  });
}


function getMenu(checkedCategory) {
  var categoryWithoutSpecialCharacters = checkedCategory.replace(/[^A-Z0-9]/ig, '_');
  const menuBody = document.getElementById('menuBody');
  const categoryContainer = document.createElement('div');
  categoryContainer.setAttribute('class', categoryWithoutSpecialCharacters);
  const categoryDiv = document.createElement('div');
  categoryDiv.setAttribute('class', 'row justify-content-center');

  const categoryHeader = document.createElement('h1');
  categoryHeader.textContent = checkedCategory;
  categoryHeader.setAttribute('class', 'categoryHeader');

  menuBody.appendChild(categoryContainer);
  categoryContainer.appendChild(categoryHeader);
  categoryContainer.appendChild(categoryDiv);

  //filters through response for items that match category and have stock in FrontRoom
  resp[0].forEach(item => {
    if (item.category === checkedCategory && item.roomInventory.FrontRoom >= 1) {
      const menuItemMainDiv = document.createElement('div');
      menuItemMainDiv.setAttribute('class', 'card col-xs-6 col-md-4 menuItemMainDiv');

      const menuItemCard = document.createElement('div');
      menuItemCard.setAttribute('class', 'menuItemCard');

      const imgDiv = document.createElement('div');
      const itemImg = document.createElement('img');
      let imageSource;
      //checks for image. If image doesn't exist, a placeholder image is used
      if (item.image === '' || item.image === null) {
        imageSource = defaultMenuImage;
      } else {
        imageSource = item.image;
      }
      itemImg.src = imageSource;
      itemImg.setAttribute('class', 'itemImg');

      const name = document.createElement('h1');
      name.textContent = item.name;
      name.setAttribute('class', 'productName');

      const priceCard = document.createElement('div');
      priceCard.setAttribute('class', 'card');

      const price = document.createElement('p');
      price.setAttribute('class', 'price');

      price.textContent = '$' + item.price;

      const description = document.createElement('p');
      item.description = item.description;
      description.textContent = item.description;
      description.setAttribute('class', 'productDescription');

      const potencyMeasure = document.createElement('p');
      potencyMeasure.textContent = `THC: ${item.thcMeasure}%    CBD: ${item.cbdMeasure}%`;
      potencyMeasure.setAttribute('class', 'productPotencyMeasure');

      categoryDiv.appendChild(menuItemMainDiv);
      menuItemMainDiv.appendChild(menuItemCard);
      menuItemMainDiv.appendChild(imgDiv);
      imgDiv.appendChild(itemImg);
      menuItemCard.appendChild(name);
      menuItemCard.appendChild(priceCard);
      priceCard.appendChild(price);
      // menuItemCard.appendChild(description);
      menuItemCard.appendChild(potencyMeasure);

      //online ordering
      // if (turnOnOnlineOrdering) {
      //   $('#onlineOrderingMenuButtons').removeClass('hidden');

      //   const itemWithNoSpecialCharacters = item.name.replace(/[^A-Z0-9]/ig, '_');
      //   const addToCartDiv = document.createElement('div');
      //   addToCartDiv.setAttribute('id', 'addToCart' + itemWithNoSpecialCharacters + 'GetQuantity');

      //   const addToCartForm = document.createElement('FORM');
      //   addToCartForm.setAttribute('action', '');
      //   addToCartForm.setAttribute('method', 'post');
      //   addToCartForm.setAttribute('class', 'quantityForm');
      //   menuItemCard.appendChild(addToCartDiv);
      //   addToCartDiv.appendChild(addToCartForm);

      //   if (item.bulkitem === true) {
      //     const addToCartField = document.createElement('input');
      //     addToCartField.setAttribute('class', 'hidden');
      //     addToCartField.setAttribute('value', 1);
      //     addToCartField.setAttribute('id', itemWithNoSpecialCharacters + 'ToCart');

      //     const addGramToCartBtn = document.createElement('button');
      //     addGramToCartBtn.setAttribute('type', 'button');
      //     addGramToCartBtn.setAttribute('name', 'submit');
      //     addGramToCartBtn.setAttribute('class', itemWithNoSpecialCharacters + 'ToCart');
      //     addGramToCartBtn.innerHTML = "<p class='itemQuantText'>+ 1g </p><p class='bulkItemPrice'>$" + item.price + "</p>";
      //     addGramToCartBtn.onclick = function () { updateOrder(item, 'Gram') };

      //     addToCartForm.appendChild(addToCartField);
      //     addToCartForm.appendChild(addToCartField);

      //     addToCartForm.appendChild(addGramToCartBtn);


      //     if (item.EightPrice > 0 && item.EightPrice !== null && item.EightPrice !== undefined) {
      //       const addEighthToCartBtn = document.createElement('button');
      //       addEighthToCartBtn.setAttribute('type', 'button');
      //       addEighthToCartBtn.setAttribute('name', 'submit');
      //       addEighthToCartBtn.setAttribute('class', itemWithNoSpecialCharacters + 'ToCart');
      //       addEighthToCartBtn.innerHTML = "<p class='itemQuantText'>+ 1/8oz </p><p class='bulkItemPrice'>$" + item.EightPrice + "</p>";
      //       addEighthToCartBtn.onclick = function () { updateOrder(item, '1/8oz') };
      //       addToCartForm.appendChild(addEighthToCartBtn);

      //     }

      //     if (item.QuaterOzPrice > 0 && item.QuaterOzPrice !== null && item.QuaterOzPrice !== undefined) {
      //       const addQuarterToCartBtn = document.createElement('button');
      //       addQuarterToCartBtn.setAttribute('type', 'button');
      //       addQuarterToCartBtn.setAttribute('name', 'submit');
      //       addQuarterToCartBtn.setAttribute('class', itemWithNoSpecialCharacters + 'ToCart');
      //       addQuarterToCartBtn.innerHTML = "<p class='itemQuantText'>+ 1/4oz </p><p class='bulkItemPrice'>$" + item.QuaterOzPrice + "</p>";
      //       addQuarterToCartBtn.onclick = function () { updateOrder(item, '1/4oz') };
      //       addToCartForm.appendChild(addQuarterToCartBtn);
      //     }

      //     if (item.HalfOzPrice > 0 && item.HalfOzPrice !== null && item.HalfOzPrice !== undefined) {

      //       const addHalfToCartBtn = document.createElement('button');
      //       addHalfToCartBtn.setAttribute('type', 'button');
      //       addHalfToCartBtn.setAttribute('name', 'submit');
      //       addHalfToCartBtn.setAttribute('class', itemWithNoSpecialCharacters + 'ToCart');
      //       addHalfToCartBtn.innerHTML = "<p class='itemQuantText'>+ 1/2oz </p><p class='bulkItemPrice'>$" + item.HalfOzPrice + "</p>";
      //       addHalfToCartBtn.onclick = function () { updateOrder(item, '1/2oz') };
      //       addToCartForm.appendChild(addHalfToCartBtn);
      //     }

      //     if (item.OzPrice > 0 && item.OzPrice !== null && item.OzPrice !== undefined) {

      //       const addOzToCartBtn = document.createElement('button');
      //       addOzToCartBtn.setAttribute('type', 'button');
      //       addOzToCartBtn.setAttribute('name', 'submit');
      //       addOzToCartBtn.setAttribute('class', itemWithNoSpecialCharacters + 'ToCart');
      //       addOzToCartBtn.innerHTML = "<p class='itemQuantText'>+ 1oz </p><p class='bulkItemPrice'>$" + item.OzPrice + "</p>";
      //       addOzToCartBtn.onclick = function () { updateOrder(item, '1oz') };
      //       addToCartForm.appendChild(addOzToCartBtn);
      //     }


      //   } else {
      //     const addToCartField = document.createElement('input');
      //     addToCartField.setAttribute('class', 'hidden');
      //     addToCartField.setAttribute('value', 1)
      //     addToCartField.setAttribute('id', itemWithNoSpecialCharacters + 'ToCart');

      //     const addToCartBtn = document.createElement('button');
      //     addToCartBtn.setAttribute('type', 'button');
      //     addToCartBtn.setAttribute('name', 'submit');
      //     addToCartBtn.setAttribute('class', itemWithNoSpecialCharacters + 'ToCart');
      //     addToCartBtn.innerHTML = 'Add';
      //     addToCartBtn.onclick = function () { updateOrder(item) };
      //     addToCartForm.appendChild(addToCartBtn);



      //   }
      // }
    }
  });
}

$(document).ready(function () {
  //appends an "active" class to profile when profile button is clicked
  $(".user").on("click", function () {
    $(".profilePopup-overlay, .profilePopup-content").addClass("active");
    $('.profileContactFormArea').removeClass('hidden');
    orderHistory = JSON.parse(window.localStorage.getItem('orderHistory')) || [];
    if (orderHistory.length > 0) {
      orderHistoryList.innerHTML = '';
      orderHistory.forEach(item => {
        let orderTotal = [];
        const orderHistoryList = document.getElementById('orderHistoryList');
        const tableRow = document.createElement('tr');
        const tableHeader = document.createElement('th');
        tableHeader.setAttribute('scope', 'row');
        tableHeader.innerHTML = item.id.substring(30);
        item.orderitems.forEach(element => {
          orderTotal.push(element.price)
        })
        let orderSum = orderTotal.reduce(function (a, b) {
          return a + b;
        }, 0);
        const dateObj = new Date(item.created.split(' ')[0]);
        const formattedDate = ((dateObj.getMonth() > 8) ? (dateObj.getMonth() + 1) : ('0' + (dateObj.getMonth() + 1))) + '/' + ((dateObj.getDate() > 9) ? dateObj.getDate() : ('0' + dateObj.getDate())) + '/' + dateObj.getFullYear();
        const tabled1 = document.createElement('td');
        tabled1.innerHTML = formattedDate;
        const tabled2 = document.createElement('td');
        tabled2.innerHTML = '$' + orderSum;
        orderHistoryList.appendChild(tableRow);
        tableRow.appendChild(tableHeader);
        tableRow.appendChild(tabled1);
        tableRow.appendChild(tabled2);
      });
    }

    if (contactInfo.length > 0) {
      //contact profile edit form
      const firstNameUpdate = document.getElementById('update-first-name');
      firstNameUpdate.setAttribute('value', contactInfo[0].firstName);

      const lastNameUpdate = document.getElementById('update-last-name');
      lastNameUpdate.setAttribute('value', contactInfo[0].lastName);

      const phoneNumberUpdate = document.getElementById('update-phone-number');
      phoneNumberUpdate.setAttribute('value', contactInfo[0].phoneNumber);

      const emailUpdate = document.getElementById('update-email-address');
      emailUpdate.setAttribute('value', contactInfo[0].email);

      const street1Update = document.getElementById('update-street-address1');
      street1Update.setAttribute('value', contactInfo[0].streetAddress1);

      const street2Update = document.getElementById('update-street-address2');
      street2Update.setAttribute('value', contactInfo[0].streetAddress2);

      const cityUpdate = document.getElementById('update-city');
      cityUpdate.setAttribute('value', contactInfo[0].city);

      const stateUpdate = document.getElementById('update-state');
      stateUpdate.setAttribute('value', contactInfo[0].state);

      const zipCodeUpdate = document.getElementById('update-zip-code');
      zipCodeUpdate.setAttribute('value', contactInfo[0].zipCode);
    }
    $("#showHistory").on("click", function () {
      $('#orderHistoryArea').removeClass('hidden');
      $('.profileContactFormArea').addClass('hidden');
    });
    $("#profileBack").on("click", function () {
      $('#orderHistoryArea').addClass('hidden');
      $('.profileContactFormArea').removeClass('hidden');
    });
  });

  //removes the "active" class to .profilePopup and .profilePopup-content when the "Close" button is clicked 
  $(".closeProfile, .deleteContactInfo, .updateInfo").on("click", function () {
    $(".profilePopup-overlay, .profilePopup-content").removeClass("active");
    $('#orderHistoryArea').addClass('hidden');
  });

  //appends an 'active' class to .shoppingCartPopup and .shoppingCartPopup-content when the 'Open' button is clicked
  $('.openCart').on('click', function () {
    if (useCanPay) {
      $(".canPay").removeClass("hidden");
    }
    const cartItems = shoppingCart.filter(item => item.qty > 0);
    if (cartItems.length > 0) {
      $('.check-out').removeClass('hidden');
      $('.empty-cart').addClass('hidden');
    }
    $('.shoppingCartPopup-overlay, .shoppingCartPopup-content').addClass('active');
    const shoppingCartDiv = document.getElementById('shoppingCartModal');
    shoppingCartDiv.innerHTML = '';
    getCartTotal();
    let showCartTotal = document.createElement('h5');
    showCartTotal.setAttribute('id', 'showCartTotal');
    showCartTotal.innerHTML = 'Total  $' + (cartTotal).toFixed(2);
    shoppingCart.forEach(element => {
      if (element.qty > 0) {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.setAttribute('id', 'cartItemLine');
        const cartPriceSpan = document.createElement('span');
        cartPriceSpan.setAttribute('id', 'cartPriceSpan');

        const cartItem = document.createElement('h5');
        const cartItemPrice = document.createElement('h5');
        const removeCartItem = document.createElement('button');
        removeCartItem.setAttribute('class', 'removeCartItemButton');
        removeCartItem.innerHTML = 'X';
        removeCartItem.onclick = function (e) {
          e.preventDefault();
          element.qty = 0;
          updateLocalStorageCart();
          const cartItems = shoppingCart.filter(item => item.qty > 0);
          shoppingCart = cartItems;
          getCartTotal();
          showCartTotal.innerHTML = 'Total  $' + cartTotal.toFixed(2);

          document.getElementById('cartItemNumber').innerHTML = '(' + cartItems.length + ')'

          shoppingCartDiv.removeChild(cartItemDiv);
          if (cartTotal < 1) {
            $('.check-out').addClass('hidden');
            $('#showCartTotal').addClass('hidden');
            $('.empty-cart').removeClass('hidden');
          }
          //converts shoppingCart to string
          var stringRepresentingShoppingCartArray = JSON.stringify(shoppingCart);
          //saves shopping cart to localStorage
          window.localStorage.setItem('shoppingCart', stringRepresentingShoppingCartArray);

          document.getElementById('cartItemNumber').innerHTML = '(' + cartItems.length + ')';

        }
        cartItem.innerHTML = '(' + element.qty + ')  ' + element.name;
        cartItemPrice.innerHTML = '$' + (element.price);

        shoppingCartDiv.appendChild(cartItemDiv);
        cartItemDiv.appendChild(cartItem, cartItemPrice);
        cartItemDiv.appendChild(cartPriceSpan);
        cartPriceSpan.appendChild(cartItemPrice);
        cartPriceSpan.appendChild(removeCartItem);
        shoppingCartDiv.appendChild(showCartTotal)
      }
    });
  });

  //removes the 'active' class to .shoppingCartPopup and .shoppingCartPopup-content when the 'Close' button is clicked 
  $('.closeCart, .cancel-order').on('click', function () {
    $('.shoppingCartPopup-overlay, .shoppingCartPopup-content').removeClass('active');
    $('.contactFormArea').addClass('hidden');
    $('.cartButtons').removeClass('hidden');
    $('.empty-cart').removeClass('hidden');
    $('#shoppingCartModal').removeClass('hidden');
    $('.check-out').addClass('hidden');
  });

  $('.place-order').on('click', function () {
    if ((orderOption === 'Pickup' && $('input#first-name').val().length != 0 && $('input#last-name').val().length != 0 && $('input#phone-number').val().length != 0 && $('input#email-address').val().length != 0) || (orderOption === 'Delivery' && $('input#first-name').val().length != 0 && $('input#last-name').val().length != 0 && $('input#phone-number').val().length != 0 && $('input#email-address').val().length != 0 && $('input#street-address1').val().length != 0 && $('input#city').val().length != 0 && $('input#state').val().length != 0 && $('input#zip-code').val().length != 0)) {
      submitOrder();


    } else {
      $("#cartMessage").append("<p>Complete Order Form Before Submitting</p>");
    }
  });

  $('.check-out').on('click', function () {
    $('.contactFormArea').removeClass('hidden');
    $('.cartButtons').addClass('hidden');
    document.getElementById('cartMessage').innerHTML = '';
    $('#shoppingCartModal').addClass('hidden');
    document.getElementById('checkoutTotal').innerHTML = '<strong>Total: $' + cartTotal;


  });
  if (turnOnOnlineOrdering) {
    //Check local storage for items in shopping cart. If there are none, it sets shoppingCart = []
    shoppingCart = JSON.parse(window.localStorage.getItem('shoppingCart')) || [];
    contactInfo = JSON.parse(window.localStorage.getItem('contactInfo')) || [];
    if (!$.isEmptyObject(contactInfo[0])) {
      const firstName = document.getElementById('first-name');
      firstName.setAttribute('value', contactInfo[0].firstName);

      const lastName = document.getElementById('last-name');
      lastName.setAttribute('value', contactInfo[0].lastName);

      const phoneNumber = document.getElementById('phone-number');
      phoneNumber.setAttribute('value', contactInfo[0].phoneNumber);

      const email = document.getElementById('email-address');
      email.setAttribute('value', contactInfo[0].email);

      const street1 = document.getElementById('street-address1');
      street1.setAttribute('value', contactInfo[0].streetAddress1);

      const street2 = document.getElementById('street-address2');
      street2.setAttribute('value', contactInfo[0].streetAddress2);

      const city = document.getElementById('city');
      city.setAttribute('value', contactInfo[0].city);

      const state = document.getElementById('state');
      state.setAttribute('value', contactInfo[0].state);

      const zipCode = document.getElementById('zip-code');
      zipCode.setAttribute('value', contactInfo[0].zipCode);
    }

    updateLocalStorageCart();
    const cartIcon = document.getElementById('cartIcon');
    cartIcon.classList.remove('hidden');
  }

  $('input:radio[name="orderOptions"]').change(
    function () {
      if (this.checked && this.value == 'delivery') {
        $('.deliveryDetails').removeClass('hidden');
        orderOption = 'Delivery';
      }
      if (this.checked && this.value == 'pickup') {
        $('.deliveryDetails').addClass('hidden');
        orderOption = 'Pickup';

      }
    });

  $('input:radio[name="paymentOptions"]').change(
    function () {
      if (this.checked && this.value == 'cash') {
        $('.canPayPin').addClass('hidden');
        $("#cashPayment").prop("checked", true);
        $("#canPayPayment").prop("checked", false);

      }
      if (this.checked && this.value == 'canPay') {
        $('.canPayPin').removeClass('hidden');
        $("#canPayPayment").prop("checked", true);
        $("#cashPayment").prop("checked", false);

      }
    });


  //Show/hide header function
  $('#toggleHeaderCheckbox').change(function () {
    const categoryCheckboxDiv = document.getElementById('categoryCheckboxDiv');
    const menuBody = document.getElementById('menuBody');
    if ($('#toggleHeaderCheckbox').prop('checked') === true) {
      categoryCheckboxDiv.classList.add('hidden');
      menuBody.classList.remove('menuBodyTopPadding');
    } else {
      categoryCheckboxDiv.classList.remove('hidden');
      menuBody.classList.add('menuBodyTopPadding');
    }
  });

  //auto scroll checkbox conditional and function
  let scrollInterval;
  $('#scrollCheckbox').change(function () {
    if ($('#scrollCheckbox').prop('checked') === true) {
      var documentHeight = $('#webmenuscript').attr('data-height');
      scroll();

      //Repeats scroll function
      scrollInterval = setInterval(function () {
        scroll();
      }, documentHeight * scrollSpeed);
    }
    //stops scrolling when checkbox is unchecked
    else if ($('#scrollCheckbox').prop('checked') === false) {
      clearInterval(scrollInterval);
    }
  });

  function scroll() {
    var documentHeight = $('#webmenuscript').attr('data-height');
    $('html, body').animate({
      scrollTop: 0
    }, 500, function () {
      $(this).animate({
        scrollTop: $(document).height() - $(window).height()
      }, documentHeight * scrollSpeed, 'linear');
    });
    //temporarily stops animation while mouse moves
    $('html, body').bind('scroll mousedown DOMMouseScroll mousewheel keyup', function (e) {
      if (e.type === 'mousedown' || e.type === 'mousewheel') {
        $('html, body').stop();
      }
    });
  }

  //creates checkboxes from json response
  function makeCheckboxes() {
    resp[0].forEach(item => {
      //if category hasn't been added and there is inventory in the FrontRoom, this will create new div/header and add category to categoryArray
      if (!categoryArray.includes(item.category) && item.roomInventory.FrontRoom >= 1) {
        categoryArray.push(item.category);
        let categoryType = document.createElement('div');
        let categoryWithoutSpecialCharacters = item.category.replace(/[^A-Z0-9]/ig, '_');
        categoryType.setAttribute('id', categoryWithoutSpecialCharacters);
        categoryType.setAttribute('class', 'categoryType');
        //displays first category on load

        getMenu(item.category);

      }
    });

    const categoryButtons = document.getElementById('product-menu-ul');
    const showAllButton = document.getElementById('showAll');
    categoryArray.forEach(item => {
      const listItem = document.createElement('li');
      listItem.setAttribute('class', 'categoryListItem')
      const anchor = document.createElement("a");
      // anchor.href = "#";
      anchor.innerText = item;
      anchor.setAttribute('class', 'categoryButton');
      anchor.onclick = function (e) {
        e.preventDefault();
        const menuBody = document.getElementById('menuBody');
        var categoryButtons = document.getElementsByClassName("categoryButton active");
        for (let i = 0; i < categoryButtons.length; i++) {
          categoryButtons[i].className = 'categoryButton'
        }
        menuBody.innerHTML = '';
        getMenu(this.innerHTML)
        this.classList.toggle('active');
        showAllButton.classList.remove('active')
      }
      categoryButtons.appendChild(listItem);
      listItem.appendChild(anchor);
    });
  }


  //api call on load
  $.ajax({
    url: 'https://api.marijuanasoftwarellc.com/v1/Products?webguid=' + webguid,
    beforeSend: function (xhrObj) {
      xhrObj.setRequestHeader('Ocp-Apim-Subscription-Key', ocpApimSubscriptionKey);
    },
    type: 'GET',
    crossDomain: true,
    contentType: 'application/json',
    data: 'json',
    success: function (data) {
      resp.push(data);
      makeCheckboxes();
      console.log(resp)
    },
    error: function (error) {
      console.log(error);
    }
  });
  const cartItems = shoppingCart.filter(item => item.qty > 0);
  document.getElementById('cartItemNumber').innerHTML = '(' + cartItems.length + ')';
});