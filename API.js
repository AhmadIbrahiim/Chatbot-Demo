var Promise = require('bluebird');
var db = require('./database.js');
var Engli = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "G", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];//Alphabet&Digit
var co = require('co');
var NLP = require('./NLP.js');
var Ans = require('./ans.js')

function Text(ID, text) {
    return new Promise((res, rej) => {
        console.log("User text : " + text + " PH:" + ID)
        co(function* () {
            var call = yield db.Step(ID, 'get', '');
            //var object = yield facebook.GetuserData(ID);
            var newtext = text.toLowerCase();
            var NL = yield NLP.GetEntitys(newtext);
            var step = call[0].step;
            var lango = call[0].lang
            console.log(call[0])
            var lang = 'ar'
            if (Engli.indexOf(text[0]) > -1) {
                lang = 'en';
            }
            if (lango == null) {
                yield db.Step(ID, 'lang', lang)
            }
            else {
                lang = lango
            }
            console.log("Lang is : " + lang)
            if (step == 'comtexten') {
                yield db.Step(ID, 'set', 'phoneen');
                res("could you please give your phone number ? or can we use your fb phone number ? ");
            }
            if (step == 'comtextar') {
                yield db.Step(ID, 'set', 'phonear');
                res("من فضلك اكتب رقم هاتفك ");
            }
            else if (step == 'phoneen') {
                if (newtext.includes('yes') || NL.phone_number != 'undefined') {
                    yield db.Step(ID, 'set', 'user');
                    yield db.Step(ID, 'lang', null)
                    res("thank you the complaint was filed and a customer service will be in touch with you soon.");
                }
                else {
                    res("You may type your phone number or reply with yes to use your facebook phone number");
                }
            }
            else if (step == 'phonear') {
                if (NL.phone_number != 'undefined') {
                    res(["شكراً لك .. تم تسجيل شكوتك وسوف يتم التواصل مع من قبل الفريق المختص ", "hank you for using MOI Chatbot, would you have a few minutes to fill a survey related to our services? It will only only be 3 questions taking about 30 seconds"]); yield db.Step(ID, 'set', 'surveryen');
                }
                else {
                    res("يجب كتابة رقم الهاتف .. لنواصل مع تسجيل الشكوى");
                }
            }

            console.log("Before English or Arabic --> ",)
            if ( lang == "en") {
                console.log("Inside text English -->")
                if ((step == 'user' || step == 'new') && typeof NL.greeting != 'undefined') {
                    res("Welcome to our MOI Chatbot, how can I help you ?")

                }

                else if (newtext == 'yes' && step == 'waityes') {
                    res(Ans.RandomYes());
                    yield db.Step(ID, 'set', 'yeshelp');

                }
                else if (newtext == 'no' && step == 'waityes') {
                    res("Okay !");
                    yield db.Step(ID, 'set', 'user');
                    yield db.Step(ID, 'lang', null)


                }
                else if (step == 'waityes') {
                    res('يكب ان يكون ردك بنعم او لا');
                }
                else if (step == 'complain') {
                    res('Ok, please type your complaint');
                    yield db.Step(ID, 'set', 'comtexten');


                }
                else if (step == "creditcarden") {
                    res("Enter the expiry date in the format mm/yyyy")
                    yield db.Step(ID, 'set', 'expen');
                }
                else if (step == "expen") {
                    res("Enter the security code at the back of the card")
                    yield db.Step(ID, 'set', 'backcodeen')
                }
                else if (step == "backcodeen") {
                    res(["Thank you for the information, Please hold until we process your payment.", "thanks for waiting, the Payment of AED 1456 was successfully processed using your credit card ending with 9999. The payment confirmation no is 293792749, would you like to receive the invoice on SMS?"]);
                    yield db.Step(ID, 'set', 'waitholden')
                    setTimeout(() => {
                        facebook.sendTextMessage(ID, "thanks for waiting, the Payment of AED 1456 was successfully processed using your credit card ending with 9999. The payment confirmation no is 293792749, would you like to receive the invoice on SMS?")
                        db.Step(ID, 'set', 'confirmsmsenglish')
                    }, 10000)
                }
                else if (step == 'confirmsmsenglish') {
                    if (newtext.includes('yes')) {
                        res(["Thank you ,We'll keep you notifed thorught SMS", "Thank you for using MOI Chatbot, would you have a few minutes to fill a survey related to our services? It will only only be 3 questions taking about 30 seconds"])
                        yield db.Step(ID, 'set', 'user');
                        yield db.Step(ID, 'lang', null);

                        yield db.Step(ID, 'set', 'surveryen')
                    }
                    else if (newtext.includes('no')) {
                        res("No problem , Enjoy your day ")


                    }
                    else if (newtext.includes('home')) {
                        yield db.Step(ID, 'set', 'user');
                        yield db.Step(ID, 'lang', "en");
                        //	message(ID,"text","hi")

                    }
                    else {
                        res("You have to reply with *yes* to proceed *no* or *home* to move to another service. .")

                    }
                }
                else if (step == 'waitholden') {

                }
                else if (step == 'nextscalfrom') {
                    if (text > 10) {
                        res("Thanks for the compliment, we will consider that as 10. :D");
                        yield db.Step(ID, 'set', 'user');
                        yield db.Step(ID, 'lang', null);

                    }
                    else if (text > 5) {
                        res("Thank you so much")
                        yield db.Step(ID, 'set', 'user');
                        yield db.Step(ID, 'lang', null);
                    }
                    else {
                        res("Sorry to hear that, can you provide us with a brief description why you rate the services this low?");
                        yield db.Step(ID, 'set', 'resonlowrate')
                    }
                }
                else if (step == 'resonlowrate') {
                    res("Thanks for your response, would you mind if one of our customer care staff contacted you to discuss your experience further more?");
                    yield db.Step(ID, 'set', 'readytocall')
                }
                else if (step == 'readytocall') {
                    if (newtext.includes('yes')) {
                        res(["Thanks! We will contact you very soon to check this matter..", "Great, Anything else I can help you with?"]);
                        yield db.Step(ID, 'set', 'waitfortrorvisa')

                    }
                    else if (newtext.includes('no')) {
                        res("Great, Anything else I can help you with?")
                        yield db.Step(ID, 'set', 'waitfortrorvisa')
                    }
                    else if (newtext.includes('home')) {
                        yield db.Step(ID, 'set', 'user');
                        yield db.Step(ID, 'lang', "en");
                        message(ID, "text", "hi")

                    }
                    else {
                        res("Please reply with *yes* or *no* or *home* to back to services")
                    }

                }
                else if (step == 'scalefrom') {
                    if (text > 10) {
                        res("Thanks for the compliment, we will consider that as 10. :)");

                    }
                    else if (text > 5) {
                        res("Thank you so much")
                    }
                    else {
                        res("We're sorry to hear that")
                    }
                    res("on a scale from 1 to 10, how do are you satisfied with the electronic services of MOI in general?");
                    yield db.Step(ID, 'set', 'nextscalfrom')
                }
                else if (step == 'surveryen') {
                    if (newtext.includes('yes')) {
                        res(['Great, thanks.', "On a scale 1 to 10, how do are you satisfied with this chatbot?"])
                        yield db.Step(ID, 'set', 'scalefrom')
                    }
                    else if (newtext.includes('no')) {
                        res('Oh Okay no problem :) ');
                        yield db.Step(ID, 'set', 'user');
                        yield db.Step(ID, 'lang', null);
                    }
                    else if (newtext.includes('home')) {
                        yield db.Step(ID, 'set', 'user');
                        yield db.Step(ID, 'lang', "en");
                        message(ID, "text", "hi")

                    }
                    else {
                        res('I expect to reply with yes, no  or *home* to back to services:) ');


                    }
                }
                else if ((newtext.includes('visa') || newtext.includes('traffic')) && step == 'waitfortrorvisa') {

                    res("Great! These are the vehicles registered with your account, for which vehicle do you wish to view?");
                    yield db.Step(ID, 'set', 'waitselection')
                }
                else if (step == 'payamountafter') {
                    console.log('Insdie payment after --> ')
                    if (newtext.includes('pay') || newtext.includes('yes')) {
                        // yield db.Step(ID,'set','user');		
                        // yield	db.Step(ID,'lang',null)

                        res("Would like to pay using this chat or using or mobile payment gateway?");

                    }
                    else if (newtext.includes('no')) {
                        yield db.Step(ID, 'set', 'user');
                        yield db.Step(ID, 'lang', null)

                        res('Okay no problem we have cancled it :) ')
                    }
                    else if (newtext.includes('home')) {
                        yield db.Step(ID, 'set', 'user');
                        yield db.Step(ID, 'lang', "en");
                        message(ID, "text", "hi")

                    }
                    else {
                        res("I expect that you will say *pay it* to proceed *no* to cancel or *home* to move to another service. ")
                    }

                }
                else if (step == 'waitselection') {
                    yield db.Step(ID, 'set', 'payamountafter')
                    res("The total amount for all fines pending payment is AED 1456, would you like to")
                }
                else if (step == 'payrelatedto') {
                    if (typeof NL.postive != 'undefined') {
                        res("Great, is the fine related to Traffic, Visa/RP, or Something else?");
                        yield db.Step(ID, 'set', 'waitfortrorvisa')
                    }
                    else {
                        res('You have to type something related to *visa* or *traffic* or *home* to back to scervice ')
                    }
                }
                else if (step == 'waitfortrorvisa' || NL.length > 1) {
                    if (typeof NL.action != 'undefined' && typeof NL.tobe != 'undefined') {

                        res("Thanks,, let me confirm, you wish to pay your " + NL.tobe[0].value + ". is this correct")
                        yield db.Step(ID, 'set', 'payrelatedto')

                    }
                    else if (typeof NL.complaint != 'undefined') {
                        res("against who ?");
                        yield db.Step(ID, 'set', 'complain')
                        //Github deploy ..
                    }
                    else if (newtext.includes('no')) {
                        res('Okay , Have a great day :) ');
                        yield db.Step(ID, 'set', 'user');
                        yield db.Step(ID, 'lang', null);

                    }
                    else if (newtext.includes('home')) {
                        yield db.Step(ID, 'set', 'user');
                        yield db.Step(ID, 'lang', "en");
                        //message(ID,"text","hi")

                    }
                    else {
                        res("Sorry !You have to answer with something related to visa or traffic or fines or home to back to serviescs  ");
                    }

                }
                else if (step == 'user') {
                    console.log('else')
                    if (typeof NL.thanks != 'undefined') {
                        res('Glad to help :) ')
                    }
                    else if (newtext.includes('no')) {
                        res("Have a great day :)")
                        yield db.Step(ID, 'lang', null)

                    }
                    else {
                        yield db.Step(ID, 'lang', null)
                        res(Ans.RandUnkown())
                    }

                }
            }
            if ( lang == "ar") {
                if ((step == 'user' || step == 'new') && typeof NL.greeting != 'undefined') {
                    // if(step=='new')
                    // {
                    // 	yield facebook.sendTextMessage(ID,"مرحباً "+object.first_name+" الى البوت التجريبى !\n نتمنى لك تجربه سعيده!");
                    // 	yield facebook.sendQuickReply(ID,
                    // 		{
                    // 			text:"هل يمكننى مساعدتك؟ ?",
                    // 			quick_replies:
                    // 			[
                    // 				{
                    // 					content_type:'text',
                    // 					payload:'yeshelpar',
                    // 					title:'نعم'
                    // 				},
                    // 				{
                    // 					content_type:'text',
                    // 					payload:'nohelpar',
                    // 					title:'لا'
                    // 				},
                    // 			]

                    // 		})

                    // 	yield db.Step(ID,'set','waityes')
                    // }
                    // else 
                    // {
                    res("اهلا   , كيف يمكننى المساعده");
                    yield db.Step(ID, 'set', 'waitfortrorvisaar')

                    //}
                }
                else if (step == 'waitselectionar') {
                    yield db.Step(ID, 'set', 'payamountafterar')
                    res("اجمالى الغرامات هي 1402 دينار .. ماذا تريد ان تفعل ؟");
                }
                else if (step == "creditcardar") {
                    res("برجاء كتابة رقم انتهاء الصلاحيه بصيغه شهر/سنه")
                    yield db.Step(ID, 'set', 'expar');
                }
                else if (step == "expar") {
                    res("برجاء كتابة الثلاث ارقام الخاص بالبنك بظهر الكارت ..")
                    yield db.Step(ID, 'set', 'backcodear')
                }
                else if (step == "backcodear") {
                    res(["شكراً لك .. برجاء الانتظار حتى يتم تنفيذ العملية", "شكراً لك .. تم تأكيد عملية الدفع مبلغ *1250 ريال * بالكارت الذى ينتهى بـ 9999.. رقم العملية هو *9895552111* هل ترغب ف استقبال المراسالات عن طريق الرسائل النصية "]);
                    yield db.Step(ID, 'set', 'waitholdar')
                    setTimeout(() => {
                        db.Step(ID, 'set', 'confirmsmsarabic')
                    }, 10000)
                }
                else if (step == 'confirmsmsarabic') {
                    if (text.includes('نعم')) {
                        res("شكراً لك  .. سوف تستقبل كل التنبيهات علي هاتفك.")
                        yield db.Step(ID, 'set', 'user');
                        yield db.Step(ID, 'lang', null)
                    }
                    else if (text.includes('لا')) {
                        res("لا مشكله .. يومك سعيد")
                        yield db.Step(ID, 'set', 'user');
                        yield db.Step(ID, 'lang', null)
                    }
                    else {
                        res("يجب ان يكن ردك .. ب *نعم* او *لا* للمتابعه")

                    }


                }
                else if (step == 'waitholdar') {

                }
                else if (step == 'payamountafterar') {
                    if (newtext.includes('ادفع')) {
                        yield db.Step(ID, 'set', 'user');
                        yield db.Step(ID, 'lang', null)



                        res("هل ترغب ف دفع المبلغ بإستخدام وسيط الدفع ام عن طريق الموبيل ؟")

                    }
                    else if (newtext.includes('الغاء')) {
                        yield db.Step(ID, 'set', 'user');
                        yield db.Step(ID, 'lang', null)
                        res("لا مشكله .. تم الغاء العملية")
                    }
                    else {
                        res("يجب عليك ان تكتب *ادفع* او *الغاء* للمتابعة")
                    }
                }
                else if (newtext == 'نعم' && step == 'waityes') {
                    res("شكراً لك .. كيف يمكننى مساعدتك ؟");
                    yield db.Step(ID, 'set', 'yeshelp');

                }
                else if (newtext == 'لا' && step == 'waityes') {
                    res("لا مشكله :)");
                    yield db.Step(ID, 'set', 'user');
                    yield db.Step(ID, 'lang', null);
                }
                else if (step == 'waityes') {
                    res('يجب ان يكون رد بـ نعم او لا');
                }
                else if (step == 'complainar') {
                    res('برجاء كتابة الشكوى : ');
                    yield db.Step(ID, 'set', 'comtextar');

                }
                else if (step == 'waitfortrorvisaar' || NL.length > 0) {
                    if (typeof NL.action != 'undefined' && typeof NL.tobe != 'undefined') {
                        res(["الـ " + NL.tobe[0].value + " الخاصه بك هي 1000 دينار", "هل تريد ان تدفعها ؟"]);

                        yield db.Step(ID, 'set', 'user');
                        yield db.Step(ID, 'lang', null)



                    }
                    else if (typeof NL.complaint != 'undefined') {
                        res(" ؟ضد من  ")
                        yield db.Step(ID, 'set', 'complainar')

                    }
                    else if (newtext.includes('فيزا') || newtext.includes('رخصه') || typeof NL.traffic != 'undefined') {

                        res("هذه هي المركبات المسجله على الحساب .. اي مركبة تريد ؟")
                        yield db.Step(ID, 'set', 'waitselectionar')
                    }
                    else {
                        res("لم افهم ماذا تريد ان اساعدك به ؟")
                    }

                }
                else if (step == 'user') {

                    yield db.Step(ID, 'lang', null)
                    res(Ans.RandUnkowAr())
                }

            }








        })

    })

}

module.exports = { Text, }