const vals = [914, 1909, 405];
const mod = 2491;

const pad = (val) => val.toString().padStart(4, '0')
for (const val of vals) {
    console.log(`C = ${pad(val)}^11 mod ${mod}`);
    console.log(`  = (${pad(val)}^3)^3 * ${pad(val)}^2 mod ${mod}`);
    console.log(`  = (${val ** 3})^3 * ${val ** 2} mod ${mod}`);
    console.log(`  = ${val ** 3 % mod}^3 * ${val ** 2 % mod} mod ${mod}`);
    console.log(`  = ${(val ** 3 % mod) ** 3} * ${val ** 2 % mod} mod ${mod}`);
    console.log(`  = ${(val ** 3 % mod) ** 3 % mod} * ${val ** 2 % mod} mod ${mod}`);
    console.log(`  = ${((val ** 3 % mod) ** 3 % mod) * (val ** 2 % mod)} mod ${mod}`);
    console.log(`  = ${((val ** 3 % mod) ** 3 % mod) * (val ** 2 % mod) % mod} mod ${mod}`);
    console.log(`C = ${((val ** 3 % mod) ** 3 % mod) * (val ** 2 % mod) % mod}\n`);
}