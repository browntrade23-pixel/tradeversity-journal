/* Brown Algo's partner coupon codes and affiliate links for the Prop firm tracker.
   COUPONS.CODE = { firmId:{ pct: discount %, url: affiliate/offer link, prog?: only plans whose name starts with this text } }
   PF_AFF = { firmId: affiliate link used by the firm's "Official website" button }
   The twice-monthly update checks these discounts. Every change must also be logged in propfirms-updates.js. */
window.PF_COUPONS={
  BROWN23:{
    earn2trade:{pct:60,url:"https://www.earn2trade.com/?a_pid=BROWN23"},
    bulenox:{pct:89,url:"https://bulenox.com/member/aff/go/brown_trader",prog:"Option 1"}
  }
};
window.PF_AFF_LINKS={
  bulenox:"https://bulenox.com/member/aff/go/brown_trader",
  earn2trade:"https://www.earn2trade.com/?a_pid=BROWN23"
};
