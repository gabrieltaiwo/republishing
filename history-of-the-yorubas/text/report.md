# OCR cleanup report

- Input lines: 42864
- Output lines: 22609
- Auto changes: 13571
- Flagged for review: 403
- Skipped via --protect-file (already-known terms): 57

| Stage | Auto | Flagged |
|---|---|---|
| page-numbers | 320 | 0 |
| running-heads | 141 | 0 |
| dehyphenate | 753 | 11 |
| reflow | 1 | 0 |
| normalize | 12356 | 0 |
| confusion | 0 | 392 |

## Flagged for human review
*Nothing below was changed — decide each yourself.*

### line-end hyphen before capital — real compound?  (11)
- L2203: `Yoruba  mind,  its  ideas  and  idiosyncracies  do  not  run  in  an  Anglo- | Saxon  channel,  it  is  not  to  be  expected  that  the  mode  of  expression`
- L18566: `ILORINS  CHECKMATED— ATTEMPTS  AT  RECONSTRUC- | TION—INTERTRIBAL WARS— BRITISH  PROTECTORATE.`
- L26509: `Adey^a,  prince  of  Ila,  Fabunmi  and  Odeyale  both  of  Mesin- | Oloja-Oke,  allied  themselves  together  to  commence  hostilities`
- L28597: `The  Rev.  J.  B.  Wood- | Dear  Sir, — I  beg  to  approach  you  with  my  humble  request :`
- L32994: `This  affair  the  Commissioners  remarked  in  a  letter  to  the  Acting- | Governor  thus  :  "  We  have  been  induced  to  visit  Oyo  on  the`
- L33697: `11.20,  Gunmodi  at  2  p.m.,  and  after  resting  here  one  hour  the  Ife- | Modakeke  battlefield  was  reached  quite  late  on  the  same  day.`
- L35319: `proved  to  be  that  the  seat  of  war  had  but  changed  from  Kiriji- | Mesin  to  Yanayo-Ikirun.`
- L36028: `opening  of  that  route  as  also  now  the  opening  of  the  Abeokuta- | Ibadan  road  which  has  been  closed  since  1877.`
- L38325: `The  following  was  the  reply  to  the  above  letter  by  the  Acting- | Governor  : —`
- L40249: `ApatiS  Balogun  of  Kemta       jHis  associates  in  the  Govern- | Agbunrin,  Balogun  of  Ilugun  i     ment.`
- L41249: `Igbomina,  log- | Igbo  Owu,  193`

### digit inside word  (379)
- L7: `...■:[5i];-: vV^^:?>';^-:...`
- L323: `...§3. The vicissitudes of [Iko3d] . . . . . .219...`
- L838: `...or carving purposes, ebony, Ata [2i] hard wood used for facing carpe...`
- L843: `...([3'ellow] and black), the rough skin plum...`
- L982: `...[0-bu-ne-ko] ; but following the Standard Al...`
- L988: `...cedes a consonant as nje, ndao, [nk6]....`
- L1120: `...g., a'nu from cini-inu, mercy ; [6'to] from 6tit6, truth....`
- L1120: `...rom cini-inu, mercy ; 6'to from [6tit6], truth....`
- L1128: `...two or three ; e.g., «ifin from [aw6fin], the palace ; hence Alafin from...`
- L1130: `...[0-oni] fromOw6ni, which is itself a co...`
- L1130: `...0-oni [fromOw6ni], which is itself a contraction ...`
- L1134: `...ing or reading, e.g., otito for [6'to] ; korik6 for k6"'"''...`
- L1134: `...reading, e.g., otito for 6'to ; [korik6] for k6"'"''...`
- L1134: `...g., otito for 6'to ; korik6 for [k6]"'"''...`
- L1171: `...[A15]...`
- L1193: `...[Aw6]...`
- L1200: `...[Aw6]...`
- L1227: `...A'yan . . anxiety, care [Ik6]...`
- L1229: `...A'yan . . a cockroach [Ik6]...`
- L1237: `...Bkbk . . guinea corn [6ri]...`
- L1239: `...Epo . . palm oil [0p6]...`
- L1241: `...Epo . . bark [Op6]...`
- L1249: `...Eri (for Ori) the head [6k6]...`
- L1255: `...Apata . . a shield [k6rik6]...`
- L1271: `...K^[16kolo] . . muddy, miry...`
- L1273: `...[K616k]^l6 . . the fox...`
- L1273: `...K616k^[l6] . . the fox...`
- L1318: `...hlk, fissured ; so also from [m6], to know ; im^, knowledge, mim^...`
- L1384: `... olu, a gimlet ; 16, to grind ; [ol6], a grinder ; we, to swim ; ow^,...`
- L1389: `...s a noun in the abstract, e.g., [m6], to know ;...`
- L1390: `...[im5], knowledge ; ri, to see ; iriri...`
- L1553: `...Owu mi behe [pup6] julo for I am most pleased at i...`
- L1593: `...[5J] in the ist person is used only ...`
- L1593: `...yio lo, or Mo iilo, I am going, [5Jo] lo for...`
- L1674: `...Emi [tik5] mi, Oil tika r^, Awa tika wa....`
- L1777: `.... . [pup6], opo...`
- L1929: `...Ojo [fir6], it is raining....`
- L2002: `...n only apply to height, as o ga [g6g6rd],...`
- L2006: `... O pon roro. It is deep red ; O [p6n] rokiroki, i.e., It is bright re...`
- L2069: `...Exclamations of disgust : [S6] ! Siyo !...`
- …and 339 more

### lone 'l' — likely 'I' or '1'  (6)
- L169: `...[l]{g) Learning 125...`
- L4862: `...Didun-[l]'Obafe...`
- L4865: `...Ire-[l]'Oba-ise...`
- L4947: `...40 Madajo-[l]'Oba...`
- L6381: `...,.,[l] !...`
- L11995: `...jojumo ni ara Ago fiyan mumusin [l]§hin odi...`

### pipe '|' — likely 'I' or 'l'  (5)
- L3185: `...^[|]kan, ^gmeji...`
- L4971: `... remain seven days at the He Mol[|]. This " distribution of honours...`
- L6650: `...i.e. a free gift of God ! The[|];irl may not even know the man u...`
- L9440: `...riction the above-mentioned Akes[|] chiefs with their men left...`
- L17033: `...(Signed) Samuel Johnson, [|] occasion....`

### 'vv' — likely 'w'  (2)
- L7098: `...mselves useful generally as men [vv]ho must keep cool heads while th...`
- L16791: `...Esu[vv]ii and Ipetu, they all agreed th...`

## Skipped via protected terms
*Matched --protect-file — not flagged, not changed.*

- L1243: `...[Ep6] . . weeds Opd...` — protected term matched: 'Ep6'
- L3224: `... so on) is contracted to Ed^ or [Od6], e.g., Edegbeta (500), Edegberi...` — protected term matched: 'Od6'
- L3452: `...this is contracted to [Ow6ni] (Oluwo being the term for a sac...` — protected term matched: 'Ow6ni'
- L3479: `...ds, and the Igbon-nas as far as [Or6]....` — protected term matched: 'Or6'
- L3756: `...The [Ow6ni] of Ife was not a son of the Olo...` — protected term matched: 'Ow6ni'
- L3764: `...has been contracted to the term [Ow6ni]....` — protected term matched: 'Ow6ni'
- L3766: `...ola nuts and bitter kolas ; the [Ow6re] of Otun with sweet water from a...` — protected term matched: 'Ow6re'
- L5271: `...9. Amep6 ,, [Abem6]...` — protected term matched: 'Abem6'
- L6488: `...yard — were first imported from [Or6] or Ila in the Igbomina province...` — protected term matched: 'Or6'
- L6878: `...Qfa, Lapemo of Ijomu near C>r6, [Onibiy6] of Guguru, Minimi of Erubu. The...` — protected term matched: 'Onibiy6'
- L8323: `... against the Suzerain, even the [Ow6ni] could not save him ; so this fa...` — protected term matched: 'Ow6ni'
- L8719: `...rders were sent from Oyo to the [Ow6ni] of If§, and the Olowu to preven...` — protected term matched: 'Ow6ni'
- L8729: `...[Od6], Iw^ta, Akinboto, Gbkngan, Isop...` — protected term matched: 'Od6'
- L8790: `...o who was nearly related to the [Ow6ni] of Ife. Oluroko protected his o...` — protected term matched: 'Ow6ni'
- L8945: `...Prince [Amod6] was one of the grandchildren of...` — protected term matched: 'Amod6'
- L8949: `... for the purpose of trade. King [Amod6] cemented and strengthened this ...` — protected term matched: 'Amod6'
- L8952: `...self the nickname, " My name is [Amod6], and I put Amod6 to death. My n...` — protected term matched: 'Amod6'
- L8952: `..., " My name is Amod6, and I put [Amod6] to death. My name is Ajebaba, a...` — protected term matched: 'Amod6'
- L8969: `...[Amod6] was ill at ease under the yoke ...` — protected term matched: 'Amod6'
- L8981: `...King [Amod6] having prevailed upon all the c...` — protected term matched: 'Amod6'
- L9126: `...At [06run] (a Gbagura town) they found fre...` — protected term matched: '06run'
- L9135: `...uishedhimself in the defence of [06run]. As long as he could handle his...` — protected term matched: '06run'
- L9277: `...(aUas Odunle) the then reigning [Ow6ni] of Ife. The most important Oyo ...` — protected term matched: 'Ow6ni'
- L9289: `...[Ow6ni]. Adegunle succeeded to the thro...` — protected term matched: 'Ow6ni'
- L9320: `...s. They were still loyal to the [Ow6ni]....` — protected term matched: 'Ow6ni'
- L9323: `...[Ow6ni] for emancipating the Oyos, but ...` — protected term matched: 'Ow6ni'
- L9436: `... war-chiefs from Akes^ were : — [Ay6], Adekambi,...` — protected term matched: 'Ay6'
- L9438: `...These chiefs from the [Ep6] districts could not endure the ...` — protected term matched: 'Ep6'
- L9441: `...Ijaye in a body and retired to [Abem6], a town 12 miles distant...` — protected term matched: 'Abem6'
- L9442: `...) under the leadership of chief [Ay6]. We now have two rival towns, I...` — protected term matched: 'Ay6'
- L9544: `...tended to be sending him to the [Ow6ni] ol Ife, who alone may be regard...` — protected term matched: 'Ow6ni'
- L9723: `...ignal by the sound of their god [Or6] to which they responded with a ...` — protected term matched: 'Or6'
- L9838: `...another direction. Once at home [E16po] prevailed on all the senior Chi...` — protected term matched: 'E16po'
- L9973: `...Ijaye, Ayo of [Abem6], Timi of Ede and others. This m...` — protected term matched: 'Abem6'
- L10072: `...§ I. Civil War at [Abem6]...` — protected term matched: 'Abem6'
- L10074: `...tween the two leading chiefs of [Abem6], Ayo the Bale and Okoyan alias ...` — protected term matched: 'Abem6'
- L10102: `...ven if it be the destruction of [Abem6] and the loss of his own liberty...` — protected term matched: 'Abem6'
- L10109: `...he fall of the city of Owu. Let [Abem6] be destroyed to-day and let me ...` — protected term matched: 'Abem6'
- L10125: `...pt private as much as possible. [Abem6] was to be taken by surprise in ...` — protected term matched: 'Abem6'
- L10137: `...[Abem6]....` — protected term matched: 'Abem6'
- …and 17 more

## Auto changes (sample)
- [page-numbers] L276: `Xll ` → ``
- [page-numbers] L332: `161 ` → ``
- [page-numbers] L333: `161 ` → ``
- [page-numbers] L334: `162 ` → ``
- [page-numbers] L335: `164 ` → ``
- [page-numbers] L396: `188 ` → ``
- [page-numbers] L397: `189 ` → ``
- [page-numbers] L399: `193 ` → ``
- [page-numbers] L400: `194 ` → ``
- [page-numbers] L401: `196 ` → ``
- [page-numbers] L524: `293 ` → ``
- [page-numbers] L525: `296 ` → ``
- [page-numbers] L526: `297 ` → ``
- [page-numbers] L527: `301 ` → ``
- [page-numbers] L528: `301 ` → ``
- [page-numbers] L530: `303 ` → ``
- [page-numbers] L553: `308 ` → ``
- [page-numbers] L555: `309 ` → ``
- [page-numbers] L556: `313 ` → ``
- [page-numbers] L558: `317 ` → ``
- [page-numbers] L559: `321 ` → ``
- [page-numbers] L561: `324 ` → ``
- [page-numbers] L567: `XV ` → ``
- [page-numbers] L586: `328 ` → ``
- [page-numbers] L587: `331 ` → ``
- [page-numbers] L588: `336 ` → ``
- [page-numbers] L589: `345 ` → ``
- [page-numbers] L610: `355 ` → ``
- [page-numbers] L611: `356 ` → ``
- [page-numbers] L612: `360 ` → ``
- [page-numbers] L613: `361 ` → ``
- [page-numbers] L614: `363 ` → ``
- [page-numbers] L630: `365 ` → ``
- [page-numbers] L632: `368 ` → ``
- [page-numbers] L634: `371 ` → ``
- [page-numbers] L635: `377 ` → ``
- [page-numbers] L656: `387 ` → ``
- [page-numbers] L657: `390 ` → ``
- [page-numbers] L658: `391 ` → ``
- [page-numbers] L659: `394 ` → ``
- …and 13530 more (see the diff)
