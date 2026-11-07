<script setup lang="ts">
const id = useId().replaceAll(':', '')
</script>

<template>
  <svg class="opening-landscape" viewBox="0 0 1600 840" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient :id="`${id}-sky`" x2=".92" y2="1">
        <stop stop-color="#3e2420"/>
        <stop offset=".55" stop-color="#ad6844"/>
        <stop offset="1" stop-color="#eac68d"/>
      </linearGradient>
      <radialGradient :id="`${id}-sun`" cx=".72" cy=".34" r=".62">
        <stop stop-color="#ffe6ad"/>
        <stop offset=".33" stop-color="#f5c388"/>
        <stop offset=".77" stop-color="#c78455" stop-opacity=".38"/>
        <stop offset="1" stop-color="#704530" stop-opacity="0"/>
      </radialGradient>
      <pattern :id="`${id}-fibres`" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(23)">
        <path d="M2 0V10M7 0V10" fill="none" stroke="#fff3cd" stroke-opacity=".13" stroke-width=".45"/>
      </pattern>
      <linearGradient :id="`${id}-bank`" x2="1" y2=".25">
        <stop stop-color="#261a18"/>
        <stop offset="1" stop-color="#59392e"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="840" :fill="`url(#${id}-sky)`"/>
    <rect width="1600" height="840" :fill="`url(#${id}-sun)`"/>
    <circle cx="1040" cy="247" r="119" fill="#ffe8b2" opacity=".28"/>
    <circle cx="1040" cy="247" r="102" fill="#ffedc4" opacity=".8"/>

    <g>
      <path d="M0 517 96 469 158 482 242 444 332 472 422 394 463 403 528 371 632 427 708 369 759 383 824 332 891 353 932 399 994 376 1052 387 1160 334 1211 358 1265 343 1357 391 1432 350 1510 392 1600 374V840H0Z" fill="#c79570"/>
      <path d="M0 598 129 543 194 560 283 501 376 528 454 478 561 493 612 448 674 460 737 421 835 484 927 454 981 472 1032 435 1118 453 1176 418 1256 463 1351 428 1435 478 1497 442 1600 466V840H0Z" fill="#a77355"/>
      <path d="M0 631Q169 589 285 606T517 558Q636 531 738 556T970 541Q1044 516 1135 551T1335 535Q1463 503 1600 542V840H0Z" fill="#d0a376"/>
      <path d="M770 564q105-25 204-5m-103 15q79-15 141-5m73-10q84-22 155-18m-66 40q97-17 195-8m-78 29q109-23 184-16" fill="none" stroke="#f8d7a1" stroke-width="2" opacity=".55"/>
    </g>

    <g fill="#674034">
      <path d="M744 590h148v58H744Z"/>
      <path d="M707 591c33-7 58-28 69-53h82c12 24 37 45 73 53l-16 12H724Z"/>
      <path d="M1180 562h173v61h-173Z"/>
      <path d="M1139 562q55-12 79-55h97q27 43 82 55l-18 10h-222Z"/>
      <path d="M763 599h13v47h-13zm48 0h13v47h-13zm48 0h13v47h-13zm344-26h12v49h-12zm48 0h12v49h-12zm55 0h12v49h-12z" fill="#dcae7c"/>
      <path d="M721 592h194m-153-42h109m281 13h227m-168-45h124" fill="none" stroke="#e3ad78" stroke-width="2" opacity=".6"/>
    </g>

    <path d="M0 688Q153 639 301 675T556 650Q675 600 799 638T1056 627Q1210 579 1342 623T1600 601V840H0Z" :fill="`url(#${id}-bank)`"/>
    <path d="M475 687q102-28 194-5m-80 22q136-24 217-11m345-39q131-34 225-11m-57 31q103-32 203-16" fill="none" stroke="#ce996b" stroke-width="2" opacity=".46"/>
    <rect width="1600" height="840" :fill="`url(#${id}-fibres)`"/>

    <g>
      <path d="M0 0h1600v43H0zm1538 42h26v798h-26zm-137 0h15v798h-15zM1408 184h145v13h-145zm0 245h145v13h-145zm0 245h145v13h-145z" fill="#38211f" opacity=".63"/>
      <path d="m1413 197 139 229m-139 16 139 229m-139-245 139-229m-139 474 139-229" fill="none" stroke="#432921" stroke-width="8" opacity=".42"/>
      <path d="M1406 43v797m133-797v797M1414 188h125m-125 245h125m-125 245h125" fill="none" stroke="#e2a971" stroke-width="2" opacity=".42"/>
    </g>
  </svg>
</template>
