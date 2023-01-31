import { VoterData } from "../types"

export default class Voter {
  readonly id: string
  readonly votingId: string
  readonly address: string
  readonly representative: string
  readonly representativeFor: string

  constructor(data: VoterData) {
    this.id = data.id
    this.votingId = data.votingId
    this.address = data.address
    this.representative = data.representative
    this.representativeFor = data.representativeFor
  }
}
