import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Audiophile } from '../target/types/audiophile';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import assert from "assert";

describe('audiophile', () => {

  // Configure the client to use the local cluster.
  const provider = anchor.Provider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.Audiophile as Program<Audiophile>;

  let userWallet = provider.wallet as NodeWallet;
  let cid = "QmPdcY6rdUNt9UyFb2WDvDe46gdUPtSKRNMjCNQfQXtKRT";
  let trackTitle = "MyTrackTitle";
  let albumArtUrl = "https://creatornode3.audius.co/ipfs/QmNk6UewWsNpZYgE9qEtMezbwtGxLRG3zUjAuBZ5Fx84zY/1000x1000.jpg";
  
  let cidSub1 = cid.substring(0, cid.length/2);
  let cidSub2 = cid.substring(cid.length/2);
  let trackAccountKey: anchor.web3.PublicKey, trackAccountBump: number;
  before(async () => {
    [trackAccountKey, trackAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [userWallet.publicKey.toBuffer(), 
          Buffer.from(cidSub1, "utf8"), 
          Buffer.from(cidSub2, "utf8")],
        program.programId
      );
      console.log(trackAccountKey);
      console.log(trackAccountBump);
      console.log("\n");
  });

  it("Upload a track", async () => {
    await program.rpc.uploadTrack(new anchor.BN(trackAccountBump), cid, trackTitle, albumArtUrl, {
      accounts: {
        track: trackAccountKey,
        user: userWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    });

    let trackAccount = await program.account.track.fetch(trackAccountKey);
    console.log(trackAccount);
    assert.ok(trackAccount.cid == cid);
    assert.ok(trackAccount.title == trackTitle);
    assert.ok(trackAccount.albumArtUrl == albumArtUrl);
  });

  let newTrackTitle = "MyUpdatedTrackTitle";
  let newAlbumArtUrl = "https://someUpdatedUrl.jpg";
  
  it("Update a track metadata", async () => {
    await program.rpc.updateTrack(newTrackTitle, newAlbumArtUrl, {
      accounts: {
        track: trackAccountKey,
        authority: userWallet.publicKey,
      },
      signers: [userWallet.payer],
    });

    let trackAccount = await program.account.track.fetch(trackAccountKey);
    console.log(trackAccount);
    assert.ok(trackAccount.cid == cid);
    assert.ok(trackAccount.title == newTrackTitle);
    assert.ok(trackAccount.albumArtUrl == newAlbumArtUrl);
  });

});
