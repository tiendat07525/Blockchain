import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.connect();

describe("TokenForge", function () {
  const INITIAL_SUPPLY = ethers.parseUnits("1000000", 18);
 
  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();
    const token = await ethers.deployContract("TokenForge", [
      owner.address,
      INITIAL_SUPPLY,
    ]);
    return { token, owner, alice, bob };
  }
 
  describe("Deployment", function () {
    it("có name, symbol, decimals đúng", async function () {
      const { token } = await networkHelpers.loadFixture(deployFixture);
 
      expect(await token.name()).to.equal("TokenForge");
      expect(await token.symbol()).to.equal("TFG");
      expect(await token.decimals()).to.equal(18n);
    });
 
    it("đặt owner đúng", async function () {
      const { token, owner } = await networkHelpers.loadFixture(deployFixture);
 
      expect(await token.owner()).to.equal(owner.address);
    });
 
    it("cấp initial supply cho owner", async function () {
      const { token, owner } = await networkHelpers.loadFixture(deployFixture);
 
      expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY);
      expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });
  });
 
  describe("Transfer", function () {
    it("chuyển token và emit Transfer", async function () {
      const { token, owner, alice } = await networkHelpers.loadFixture(deployFixture);
      const amount = ethers.parseUnits("100", 18);
 
      await expect(token.transfer(alice.address, amount))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, alice.address, amount);
 
      expect(await token.balanceOf(alice.address)).to.equal(amount);
    });
 
    it("revert khi không đủ số dư", async function () {
      const { token, alice, bob } = await networkHelpers.loadFixture(deployFixture);
 
      await expect(
        token.connect(alice).transfer(bob.address, 1n)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });
 
    it("revert khi chuyển tới address(0)", async function () {
      const { token } = await networkHelpers.loadFixture(deployFixture);
 
      await expect(
        token.transfer(ethers.ZeroAddress, 1n)
      ).to.be.revertedWithCustomError(token, "ERC20InvalidReceiver");
    });
  });
 
  describe("Approve / transferFrom", function () {
    it("approve đặt allowance và emit Approval", async function () {
      const { token, owner, alice } = await networkHelpers.loadFixture(deployFixture);
      const amount = ethers.parseUnits("50", 18);
 
      await expect(token.approve(alice.address, amount))
        .to.emit(token, "Approval")
        .withArgs(owner.address, alice.address, amount);
 
      expect(await token.allowance(owner.address, alice.address)).to.equal(amount);
    });
 
    it("transferFrom chuyển token và trừ allowance", async function () {
      const { token, owner, alice, bob } = await networkHelpers.loadFixture(deployFixture);
      const amount = ethers.parseUnits("50", 18);
 
      await token.approve(alice.address, amount);
      await token.connect(alice).transferFrom(owner.address, bob.address, amount);
 
      expect(await token.balanceOf(bob.address)).to.equal(amount);
      expect(await token.allowance(owner.address, alice.address)).to.equal(0n);
    });
 
    it("transferFrom revert khi vượt allowance", async function () {
      const { token, owner, alice, bob } = await networkHelpers.loadFixture(deployFixture);
 
      await token.approve(alice.address, 10n);
 
      await expect(
        token.connect(alice).transferFrom(owner.address, bob.address, 11n)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");
    });
  });
 
  describe("Mint (owner-only)", function () {
    it("owner mint được và tăng totalSupply", async function () {
      const { token, alice } = await networkHelpers.loadFixture(deployFixture);
      const amount = ethers.parseUnits("500", 18);
 
      await expect(token.mint(alice.address, amount))
        .to.emit(token, "Transfer")
        .withArgs(ethers.ZeroAddress, alice.address, amount);
 
      expect(await token.balanceOf(alice.address)).to.equal(amount);
      expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY + amount);
    });
 
    it("non-owner mint bị revert", async function () {
      const { token, alice } = await networkHelpers.loadFixture(deployFixture);
 
      await expect(
        token.connect(alice).mint(alice.address, 1n)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
 
    it("mint tới address(0) bị revert", async function () {
      const { token } = await networkHelpers.loadFixture(deployFixture);
 
      await expect(
        token.mint(ethers.ZeroAddress, 1n)
      ).to.be.revertedWithCustomError(token, "ERC20InvalidReceiver");
    });
  });
 
  describe("Burn", function () {
    it("holder burn token của mình, totalSupply giảm", async function () {
      const { token, owner } = await networkHelpers.loadFixture(deployFixture);
      const amount = ethers.parseUnits("100", 18);
 
      await expect(token.burn(amount))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, ethers.ZeroAddress, amount);
 
      expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY - amount);
      expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - amount);
    });
 
    it("non-owner holder cũng burn được token của chính họ", async function () {
      const { token, alice } = await networkHelpers.loadFixture(deployFixture);
 
      await token.transfer(alice.address, 100n);
      await token.connect(alice).burn(40n);
 
      expect(await token.balanceOf(alice.address)).to.equal(60n);
    });
 
    it("burn vượt số dư bị revert", async function () {
      const { token, alice } = await networkHelpers.loadFixture(deployFixture);
 
      await expect(
        token.connect(alice).burn(1n)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });
  });
 
  describe("Ownership", function () {
    it("chuyển quyền sở hữu; owner cũ mất quyền mint", async function () {
      const { token, owner, alice } = await networkHelpers.loadFixture(deployFixture);
 
      await token.transferOwnership(alice.address);
 
      expect(await token.owner()).to.equal(alice.address);
      await expect(
        token.connect(owner).mint(owner.address, 1n)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
      await token.connect(alice).mint(alice.address, 1n);
      expect(await token.balanceOf(alice.address)).to.equals(1n);
    });
 
    it("non-owner không thể transferOwnership", async function () {
      const { token, alice, bob } = await networkHelpers.loadFixture(deployFixture);
 
      await expect(
        token.connect(alice).transferOwnership(bob.address)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });
});