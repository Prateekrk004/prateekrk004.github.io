/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  name: string;
  price: number;
  category: 'Starters' | 'Signature Mains' | 'Coastal Seafood' | 'Desserts';
  rating: number;
  available: boolean;
  image: string;
}

/**
 * An exclusive collection of 25 premium, non-veg, and high-end restaurant menu items.
 * Optimized with high-resolution, fast-loading, zero-hotlinking-restriction images.
 */
export const products: Product[] = [
  {
    name: "Classic Wagyu Burger",
    price: 1850,
    category: "Signature Mains",
    rating: 4.9,
    available: true,
    image: "https://lh3.googleusercontent.com/aida/ADBb0ujqMzyP563R3peK07jU4quQdWo1VSCWTdeoolbH4ZGO9CRL3d_BbzeiE4VS7nPFHZsqmH0-uYW9KHDMlfDrWo-aexpPDMh8Pp686gH31MfuH9rqLXaX-BRpYSHue-4glP-e884ngsw_k8jy2fY571wgCIUyw4xMSOI86F2j-D2tQuEVTSur9oQXXyAtiVenUECo4CvbPlZ9cvZcREnA2BliJOcf5mbcYO-qv9G3IZEZzNOzY3z2W6gy1eI"
  },
  {
    name: "Double-Smoked BBQ Wings",
    price: 750,
    category: "Starters",
    rating: 4.7,
    available: true,
    image: "https://lh3.googleusercontent.com/aida/ADBb0ugeeKpR-nJ3UR5qGqjGVK92RYDBxnHa7RmdqtBVfDfSAoG4EbSv9cMw2KGg0YX1mR3TmmNla_09F3V7KryxqK_mx848uQHCyo6GdIJvBTNIs6ymobKyvSdENSVti0KyzpJzaL28xC8XsWgPHutwDJJF4gnZs886iCpurSt_UrDoaDSZu3fE9y6MJFIL9i8khZm3Dk4te1sPcji2AwRXwtZFLGzk5RBlV-LTo3VwhpLNaqt66XxHf8INkI0"
  },
  {
    name: "Aged Basmati Mutton Biryani",
    price: 1550,
    category: "Signature Mains",
    rating: 4.9,
    available: true,
    image: "https://lh3.googleusercontent.com/aida/ADBb0uhPqaHRR54xuHWew8eA1KRVVQ3iFBH14xhCKFfXaXpMZ6se1s2t_rowaeTQpX77psJWiiEK9dXtgY9MAklXAhd1wkdSl39Hrwk2NymPAE1aHje-LW7_eXSalLLbu7p_hmc2GVbdKF3Uwb6bzG0oPOf5KjgbFdgJYVVnqN5MUDUJQa0q6ytGK_gTq0_XkPmRv6vqegi-sOVNo6c62hAjM1UVS1C5Y_w-N9D4kcOzlCNpU50cQcBpj1x5uQA"
  },
  {
    name: "Aromatically Infused Mutton Curry",
    price: 1400,
    category: "Signature Mains",
    rating: 4.8,
    available: true,
    image: "https://lh3.googleusercontent.com/aida/ADBb0uhowfnyesTeh4ntP9RQVzXloO6CxHzYN5OhrQ7aCQgGb3xgkcCBeShRXzYJIlB_imAlG3QQh2DmNF7sYDEXM_9gIjBiYgko6WEC9k_zMLtRuPIAEHz-5ljoHOmkioIpstVdlTGcS-lmbqwqrNFWzAY-NTVfYoUDJq9qMXDvYLp5gW0kFK63SQfGWmnlj-BEvJ2bQpc9ecM7WKujgWLPvs2MaYS-TH8zmx_w9BsSujaVz7wDtbm6Y-lqjP8"
  },
  {
    name: "Imperial Seafood Platter",
    price: 3200,
    category: "Coastal Seafood",
    rating: 4.9,
    available: true,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKTpDw2aWJbUOQm-UgcDXnP_MsCj9TYPINfjHa428pKjja3I1ZAUvu2hveLepxdY_31Zew0gpkIg6AT12v8ZKds3g0W2riqb4ppHOdcHkYwOtPh84xI7pNzwUKI467eLUxnjPCrazcgb2m0WTtVfJG3JoGkmx5yIkaBDIvlHVE7mm-EZL5Vnsstaw_EH2cZeRTorKP9Gy1FkMFTXQVcIounV4JSs1bBdmFmVMugYXlp1l2aqYQIgBUeLnnstDSoG33mmZiD_zWi-Y"
  },
  {
    name: "Tandoori Bhatti Chicken",
    price: 950,
    category: "Starters",
    rating: 4.8,
    available: true,
    image: "https://lh3.googleusercontent.com/aida/ADBb0ui8Th4-At3RTGdPJLvqzlL2npudY8a9xGlxNT03WmDuhXhKlGAis2426pzsljeQJ-fLSuUji8n_SgUvfdi8ycg2KRc-eHIRKRmr8ss0zDacawVG7XeIjPBW0UTAeZgJJEkj2O6f2wyiZSzlnvQRxVPdnp7aHVr9OGQ0TwViVCbpwc1KAZmHGepJMrSeVRkjrVieqgkS7_bizg1Phm44ruRIotSna2j_zob20sWmzeaINmk4OdHT2EYxLJk"
  },
  {
    name: "Flame-Grilled Salmon Fillet",
    price: 2100,
    category: "Coastal Seafood",
    rating: 4.8,
    available: true,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWY4PwHj24k-Se2ZTMG7Tk_L_-aIN_XtlYWH0hwsHP3qnW6wlLY0aeS-H7DOicA9ILoHH8RxeIELVm5dV4qvWcgyApP2M420wNlHMLH23DOHGxK9_JkiG2_uYLCMDtB-MwwZpUNmyaaWfMs8Jweu-Ljs8A7QVk2qytMGsul1WbkzZphrWJ_w5cOqMilVVyl0O0kyHROR-EXJ4Z98ECZx1HCLqQ_A9kE9AQNftYEgaDkCdKWZ4i3wOgDQwzOBuBFq4wJnMXq8GwvIc"
  },
  {
    name: "Lamb Galouti Kebab",
    price: 1100,
    category: "Starters",
    rating: 4.9,
    available: true,
    image: "https://lh3.googleusercontent.com/aida/ADBb0ugsXj-3f4wVAI-jmDTNv4oPXKz_YYUKpr4zqqRU-hyNvRqHKjhzp-tLSVGI2-_lJS8u9d_80piEq9G5izyrD6uT7Eh1MMBLWMiYO1Zg12yrQYy1Oiu4sYjh5vRH9yuyEQ_IO5iK4BlyIGB3Wh6ZsYceT-Z7dVxhd9Flwnur3GGxU3kJ5O77c11qknoMsshOXjPKZbomIA34FbP44K0zUhYtZijcMJn3UanmRqMGN6qRZbUP9QDmqwH1Mps"
  },
  {
    name: "Crispy Soft-Shell Crab",
    price: 1650,
    category: "Coastal Seafood",
    rating: 4.6,
    available: true,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDrCGDvgasH4_UGx22ka4ex3lccjfLqX3IgwCfugG0NguX_OcLLWP77G5_U_vigtOg1jovDN4Hd3wfH2--TCFoImvmPa-Xg5SMKIC9ZbQO2l4BYPD3nCKJwcwvpQGDdyEYYZMpxrwpuDk3SPFX8l-F-gpNV2doQY0MOLanvU2Rr6Nwl8bwgpPL59XzXWzXqo30Ig6hSwYiSS44doYXSeLfzhg9cVi57EogcboFJK7PpsaaZbCOx4vkh66DfiBQd57VOYHrEnLFPISY"
  },
  {
    name: "Slow-Cooked Nalli Nihari",
    price: 1600,
    category: "Signature Mains",
    rating: 4.9,
    available: true,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQWl4-j23fjGY9JBWVqErk2eIKcHJaDWyarGvSjTgdm16igfRzcML0ZxSS4-pbPoZpDfGvjlltRIGt4s47UUGqqdsSPEk4UOKM23wvM3dtho5D_dXAcD5qAFH82yBmVjqMFHO1FnvqjoJkCmlQ0l2c7DT8QxoRcHDxMcs1h7fq1vSl6in3I_Z3xC-nzBQ4rggScdq9H6YFDBlQmO61dEpDXtqz3-h22Ev_6zE7e5slVHukQiETgXgq0QJyEKjJ3Sj4O55qKckUXcU"
  },
  {
    name: "Truffle Roasted Chicken Duo",
    price: 1350,
    category: "Signature Mains",
    rating: 4.7,
    available: true,
    image: "https://lh3.googleusercontent.com/aida/ADBb0uiEHukwfEfUmGnQiyRhRla-euUC4DI5ZJuorJ_I7nSSYLjG5j7awE3YCXVoAkb5n2NaBnklTDKwhqpZIHX4rZ4MTb-gF78ndH4imAoAYZBjUUyzfIpNdQOu1OvkWhMUOoxlFYDVxhNh84dyUoGditdlGuOClnSokzUROpgrqHqfTdEGEzC4f40xSxph2a5cp8nrTXS2Y0EDwV1FBENbc5UeZm1U1EtzClyah-WoAcYZXNblGA-LFhujkbI"
  },
  {
    name: "Butter Chicken Pot Pie",
    price: 1250,
    category: "Signature Mains",
    rating: 4.8,
    available: true,
    image: "https://lh3.googleusercontent.com/aida/ADBb0ui97OATS9ZMAsCRa6OZoue8i9frfHv3dQYM4AefrUbP0PvnZknNgQA4nDtX4zzG2kBurFdXu_BcGkqElo2XJTViApZmOTfE3mj2XN_EFshMFO-WM8ZEJiifcFRcQT5r3g9QMyVl2fpYoUXNHFyhuQVVMa02_1x3QneHR-_PuKlT0lwyJS_oHaHgIofOXQgw2qnTFTUPD6Ahk0wite9FN39FW7uFqs623BIIQRhqJE3XLPEslmoDrCEpBA0"
  },
  {
    name: "Pan-Seared Hokkaido Scallops",
    price: 1950,
    category: "Coastal Seafood",
    rating: 4.8,
    available: true,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-TBsM9MXA3HkywDzdeIKupD-gAWwWHu1QgzeRngDeS_16zjBZF72MAbcT__6K_EkYaokJMsUwskTmqKKT-ES5MXp41j75X0w_kNvZ_DlNEbnkcviNYWvmyoyk255veWI21rFqBqEFn5dCVIkQCW-5w5RlPmdu2_ljUHJbwXnkJ5TrpOne4j4-lky7XdvnZDBxIaM-sgrO7r0con2D0_rhGf9nF5DOSJw9w2PT0GAHy35j8XvqeVY5GW4utKGR5fBygp4isgFvtpo"
  },
  {
    name: "Peri-Peri Chicken Skewers",
    price: 850,
    category: "Starters",
    rating: 4.6,
    available: true,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvjUQnz8oxS_IedBPkxX4Yh-m8ZPFMX1CI1VUY3iOaoZa3hwQTDkF_qoJWTEQwrEhHJy3B9oJ1W_-CY0Ky8KEXCFcRrULCwj6BN7Z9jCEBUa-OyvP6tgHRAX6ylvr_NGTXjfP47Yboob89p-YJYNKPtV4_2XaeVALVHGK0CcRaoSCJTeGEVWfd9sYynTwwb2_c_Ari6AF60qXx06akpY6OnOG0nfzbcigdS69Owx9eELVQiUGmtXfw95O5mluzrP7ig02fJHB2Pws"
  },
  {
    name: "Crab Masala",
    price: 2400,
    category: "Coastal Seafood",
    rating: 4.7,
    available: false,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOfzD4ffm7GyYJgXX380uCV9TXR2j8t9qNcV6rsiYPhx3xcBA8xebnGPV9HreM8_0IlEipcYULuCA4DOURZO89_tgMKZzqTqtwV1z5-P-d7FmaLiNZuuXp6ArhDa_4XDZ8-yD1Tb9PXfkMeRzgr8kQNiAL130rGpBWAYh-K_pWUpOcEOqc3ThTMDBvghdeAZ6J5FIUc770UKNRo9ePaJtCXw2-w2rt1ji_1m1rA-IsChtK3-plLjyJn18F1Y3JKctN_9bLSlaAD1U"
  },
  {
    name: "Old Delhi Chicken Biryani",
    price: 1200,
    category: "Signature Mains",
    rating: 4.8,
    available: true,
    image: "https://lh3.googleusercontent.com/aida/ADBb0uhPqaHRR54xuHWew8eA1KRVVQ3iFBH14xhCKFfXaXpMZ6se1s2t_rowaeTQpX77psJWiiEK9dXtgY9MAklXAhd1wkdSl39Hrwk2NymPAE1aHje-LW7_eXSalLLbu7p_hmc2GVbdKF3Uwb6bzG0oPOf5KjgbFdgJYVVnqN5MUDUJQa0q6ytGK_gTq0_XkPmRv6vqegi-sOVNo6c62hAjM1UVS1C5Y_w-N9D4kcOzlCNpU50cQcBpj1x5uQA"
  },
  {
    name: "Crispy Calamari Strips",
    price: 890,
    category: "Starters",
    rating: 4.5,
    available: true,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKTpDw2aWJbUOQm-UgcDXnP_MsCj9TYPINfjHa428pKjja3I1ZAUvu2hveLepxdY_31Zew0gpkIg6AT12v8ZKds3g0W2riqb4ppHOdcHkYwOtPh84xI7pNzwUKI467eLUxnjPCrazcgb2m0WTtVfJG3JoGkmx5yIkaBDIvlHVE7mm-EZL5Vnsstaw_EH2cZeRTorKP9Gy1FkMFTXQVcIounV4JSs1bBdmFmVMugYXlp1l2aqYQIgBUeLnnstDSoG33mmZiD_zWi-Y"
  },
  {
    name: "Herb Butter Garlic Prawns",
    price: 2200,
    category: "Coastal Seafood",
    rating: 4.9,
    available: true,
    image: "https://lh3.googleusercontent.com/aida/ADBb0uhik_puJc31ReLGOOd_gpu4s7aaXfIG6TM1FK0qUOpCSFx4x46vhI4sW9phb2au8Ue2ltl02XeGpW8Qu1pEuYibkVDiOkbzkfVOo5q40HoM0h5ToKVJLNAhTUt6H2_u6FuDUqALxfexg8may6cxSmVfm3lzNxxXYDQmLnbshlsCppoD9MEYDFRue-okztI9PHTl2X4VSF1Y_cbC5YEzPsloeL8HxYTj5_ho2piJkSSmnH4eQGI0njbiOQc"
  },
  {
    name: "Classic Lobster Thermidor",
    price: 3600,
    category: "Coastal Seafood",
    rating: 4.9,
    available: true,
    image: "https://lh3.googleusercontent.com/aida/ADBb0uhLFy0ikEsQrmAcFtTrK1I0Dd1_L_3oFLm_uUHkdlW4EQmsAXQOdLtC4c-ngAKwZT1MDJ0pCW0bRU5XEML7dMAYO-GX0iFGdt-xGFSG6bT0dziWDYWNsDa816WJEXGdfSwyvC2JMqpRmXE1l5lI2JF8mY-kqZ89X2X_axFArlqQGvZyKxbed_FbZJVB26uUV3xxJ5En_25kNKr63T1DSb0yhGdqzpmVCl2YgeJxze2qRee5xBPARt05kdc"
  },
  {
    name: "Gold-Leaf Wagyu Ribeye",
    price: 4500,
    category: "Signature Mains",
    rating: 4.9,
    available: true,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCewh3rkwbpYRM0Vilyros2-VgQl4YIBY5VDwmj3NWcgegY_VPDMRCrqOajm2paad1XlgHL0EdjigIaGk2CKOVFdRQrYdVY8afJkmf_cPW2vaGE61xxfndUvapK_OT5R29unFlz4RcKO8OAQLfbTD_Hz15UzYd_4ndgOFD5lIjbpCVGkBc6hi6QAgdR65e7r7m2yLTqj92oL-8SnpNqtRioWs2H8yp845uu9lJ__Ej_9sEK7vOkWTRp6zPM2tkXOpfN3qrmYFGHic"
  },
  {
    name: "Mutton Seekh Kebab Shaslik",
    price: 1050,
    category: "Starters",
    rating: 4.7,
    available: true,
    image: "https://lh3.googleusercontent.com/aida/ADBb0ugsXj-3f4wVAI-jmDTNv4oPXKz_YYUKpr4zqqRU-hyNvRqHKjhzp-tLSVGI2-_lJS8u9d_80piEq9G5izyrD6uT7Eh1MMBLWMiYO1Zg12yrQYy1Oiu4sYjh5vRH9yuyEQ_IO5iK4BlyIGB3Wh6ZsYceT-Z7dVxhd9Flwnur3GGxU3kJ5O77c11qknoMsshOXjPKZbomIA34FbP44K0zUhYtZijcMJn3UanmRqMGN6qRZbUP9QDmqwH1Mps"
  },
  {
    name: "Crème Brûlée",
    price: 700,
    category: "Desserts",
    rating: 4.8,
    available: true,
    image: "https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Pistachio Honey Baklava",
    price: 800,
    category: "Desserts",
    rating: 4.9,
    available: true,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDUL965aXuU3YWP3hqcMhdd-pHAVJbPy5qiN3OdRBChOmxn1HoVgyYS22LIZQQxUE0Wc45SfVfGatpPtZA7Ck-rWllhTj8dFfElFSa0ASo6pAqElf2Z9l2SiVCh5J1o122MqknrZlPVzI8iqgQxDblyoblHWNozpQYQ5960e6-eN1rTQWuYXkW0o1d81iRBKDVG0sHIf2IPPgsWd1xwj94-wNZS2FVVAU3vyMxKd3dRmROkY4VFHARQrHsfNLnVInA5fkleveIljk"
  },
  {
    name: "Molten Lava Chocolate Cake",
    price: 750,
    category: "Desserts",
    rating: 4.8,
    available: true,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0w7TjppDJwyr4ms-JYYgbTmh5H6VZcjIMuvbc-rPEWaiZqDodd93_csajTTBbVU-WVjhCzFZuLZjadzpth9VOfUTxBsm4_PoYwsrO-B8BxIL_qDq_tYLxVQ_j7N8YT9wbuH0NKap4rxUQdsV8oWV21Vyl6gRLCLfezp2YsC3hgm03PDj2HcKJYHY-gZLxnKAcDp-VZMCaSNbuOY90ZKblyHetgRJ7OkDdy3bpzgA48IXVjV9sZ-eTSCyLUwEv8I_qJe8Yv7VJa1o"
  },
  {
    name: "Saffron Cream Rasmalai Cup",
    price: 650,
    category: "Desserts",
    rating: 4.9,
    available: true,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkVRbe1MYZlC586tEt90wngsbvMIZ80RAz256QL6okuxHO1nUvQJ0didYmYzJZp1ExWfcwO6mjwH7pFt1rFxzwNs9JEj257hbqyp_Hsh7fT_yhn2KEi93luqIqugLKKTd1bXmmA8_zrTAVo9XRptRnmpPsvb3HoGEvxZMkQYhtCS5Vr-Gfa2lO0u9vO-zt8CipblQ0057k7RvOXzw9CpKEuKT_Q1V_fXRmS3BOhryJ2OIgqmSWmLf6ASxYZsyKQobk-_rwO_NQhmk"
  }
];
